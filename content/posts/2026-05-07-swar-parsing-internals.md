Title: SWAR Parsing Internals
Date: 2026-05-07
Desc: How SIMD-Within-A-Register turns ordinary 64-bit integers into 8-lane parallel byte processors.
Tags: systems, performance

---

SWAR — *SIMD Within A Register* — is the trick of treating an ordinary
machine word as a small vector. A `uint64_t` becomes eight one-byte lanes;
arithmetic and bitwise operators become broadcast operations. No SIMD
instructions, no intrinsics, no architecture switches: just
the integer ALU that every CPU has had since forever.

It is the cheapest portable parallelism you can buy.

## Why parsing benefits

Parsing is byte-at-a-time work. The naïve loop spends most of its time
in branchy control flow: "is this byte a digit? a delimiter? a
quote?" — eight conditional jumps per cache line, each with mediocre
predictability when the data is structured but unpredictably so (CSV,
JSON, log lines).

SWAR collapses eight of those questions into one. You load eight
bytes, compute a mask in a few cycles, and then either consume the
whole word or use `__builtin_ctz` to jump straight to the
interesting byte.

## The core trick: parallel comparison

The textbook example is "find the first byte equal to a target".
Given `uint64_t v` (the eight bytes you just loaded) and a target
byte `c`:

```c
static inline uint64_t broadcast(uint8_t c) {
    return 0x0101010101010101ULL * (uint64_t)c;
}

static inline uint64_t mask_eq(uint64_t v, uint8_t c) {
    uint64_t x = v ^ broadcast(c);     // zero in lanes that match
    uint64_t y = x - 0x0101010101010101ULL;
    uint64_t z = ~x & 0x8080808080808080ULL;
    return y & z;                       // high bit set in matching lanes
}
```

The arithmetic looks like a magic trick the first time you read it,
but it is just borrow propagation. Subtracting `0x01` from a zero
byte borrows from the next lane and flips the high bit on. The
`~x & 0x80…` mask suppresses any high bits that came from a non-zero
input, which would otherwise produce a false positive.

The result is a 64-bit value with `0x80` in every matching lane
and `0x00` everywhere else. `__builtin_ctzll(mask) >> 3` gives the
index of the first match. Branchless. Six dependent ops.

## Range checks: digits in one shot

For "is this byte a digit (0–9)?" you can chain two of these into a
range check:

```c
static inline uint64_t mask_digit(uint64_t v) {
    uint64_t too_low  = (v - broadcast('0')) & 0x8080808080808080ULL;
    uint64_t too_high = (v + broadcast(0x7f - '9')) & 0x8080808080808080ULL;
    return ~(too_low | too_high) & 0x8080808080808080ULL;
}
```

Same idea: nudge the byte so the high bit signals the answer, then
combine. CSV parsers use this constantly — the boundary between
"digits" and "everything else" is the boundary between a numeric
field and a delimiter.

## Where it stops being free

SWAR is not magic. Three rough edges:

1. **Misaligned loads.** You usually want to read words at arbitrary
   byte offsets. On x86 this is fine; on older ARM it traps. Most
   parsers either align the buffer up front or handle a one-time
   prologue with the scalar path.
2. **Tail handling.** The last 1–7 bytes of a buffer don't fill a
   word. Either pad the buffer (allocate +8 and zero it), or branch
   to a scalar tail. Padding is faster but requires control over
   allocation.
3. **Endianness.** The `__builtin_ctz` index assumes little-endian
   byte order. On big-endian machines you want `__builtin_clz`.
   Most code that cares about this just `#ifdef`s it.

## Where it pays off

The wins compound when you have multiple things to look for in the
same byte: a CSV scanner cares about `,`, `\n`, `"`, and `\\`
simultaneously. With SWAR you compute four masks in parallel, OR
them, and find the next "interesting" byte in a single `ctz`. The
common case — long runs of uninteresting bytes — costs you a load
and a handful of integer ops per eight bytes.

I'll get into the column-store ingestion path next, where we feed a
SWAR scanner directly into a typed-column writer with no intermediate
copy. That's where SWAR stops being a clever trick and starts being
the load-bearing part of the design.
