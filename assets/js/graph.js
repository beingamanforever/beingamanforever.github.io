// Force-directed graph of notes (post nodes) and the tags that connect them.
// No external dependencies: tiny Verlet-style force simulation rendered to SVG,
// pointer-capture drag for fluid interaction, wheel-to-zoom around cursor,
// click-empty-and-drag to pan, click-node to open the linked URL.
//
// Tunables (kept as fields so they can be hot-tweaked from devtools):
//   repulsion    : Coulomb-like inverse-square push between every pair.
//   springLength : ideal edge length.
//   springK      : Hooke spring stiffness for edges.
//   gravity      : pull toward the camera centre, keeps the graph on-screen.
//   damping      : per-tick velocity scaling. Lower = bouncier.
//   alpha        : global "energy" multiplier; reheats on interaction.

(function initGraph() {
    const svg = document.getElementById('graph-svg');
    const stage = document.getElementById('graph-stage');
    const dataEl = document.getElementById('graph-data');
    const emptyEl = document.getElementById('graph-empty');
    if (!svg || !stage || !dataEl) return;

    let raw;
    try {
        raw = JSON.parse(dataEl.textContent || '{"nodes":[],"links":[]}');
    } catch {
        raw = { nodes: [], links: [] };
    }
    if (!raw.nodes || raw.nodes.length === 0) {
        if (emptyEl) emptyEl.hidden = false;
        return;
    }

    const SVG_NS = 'http://www.w3.org/2000/svg';

    // -- Build node + link state ---------------------------------------------
    const nodes = raw.nodes.map((n, i) => {
        const angle = (i / raw.nodes.length) * Math.PI * 2;
        const r0 = 60 + Math.random() * 30;
        return {
            ...n,
            x: Math.cos(angle) * r0,
            y: Math.sin(angle) * r0,
            vx: 0,
            vy: 0,
            radius: 4 + Math.sqrt(n.weight || 1) * 3.2,
            pinned: false,
            highlight: false,
        };
    });
    const idMap = new Map(nodes.map((n) => [n.id, n]));
    const links = (raw.links || [])
        .map((l) => ({
            source: idMap.get(l.source),
            target: idMap.get(l.target),
            weight: l.weight || 1,
        }))
        .filter((l) => l.source && l.target);

    // Adjacency for hover focus.
    const neighbours = new Map(nodes.map((n) => [n.id, new Set([n.id])]));
    for (const l of links) {
        neighbours.get(l.source.id).add(l.target.id);
        neighbours.get(l.target.id).add(l.source.id);
    }

    // -- Camera (pan + zoom) -------------------------------------------------
    const cam = { x: 0, y: 0, zoom: 1 };

    // -- Constants -----------------------------------------------------------
    const sim = {
        repulsion: 1400,
        springLength: 70,
        springK: 0.045,
        gravity: 0.025,
        damping: 0.82,
    };
    let alpha = 1;

    // -- SVG scaffolding -----------------------------------------------------
    const root = document.createElementNS(SVG_NS, 'g');
    root.setAttribute('class', 'graph-root');
    svg.appendChild(root);

    const linkLayer = document.createElementNS(SVG_NS, 'g');
    linkLayer.setAttribute('class', 'graph-links');
    root.appendChild(linkLayer);

    const nodeLayer = document.createElementNS(SVG_NS, 'g');
    nodeLayer.setAttribute('class', 'graph-nodes');
    root.appendChild(nodeLayer);

    const linkEls = links.map((l) => {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('class', 'graph-link');
        linkLayer.appendChild(line);
        l.el = line;
        return line;
    });

    const nodeGroups = nodes.map((n) => {
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', `graph-node graph-node-${n.type}`);
        g.setAttribute('data-id', n.id);
        if (n.url) g.setAttribute('data-url', n.url);

        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('r', n.radius);
        circle.setAttribute('class', 'graph-node-dot');
        g.appendChild(circle);

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('class', 'graph-node-label');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dy', -(n.radius + 8));
        label.textContent = n.label;
        g.appendChild(label);

        nodeLayer.appendChild(g);
        n.el = g;
        n.dotEl = circle;
        n.labelEl = label;
        return g;
    });

    // -- Resize handling -----------------------------------------------------
    const sizeSelf = () => {
        const rect = stage.getBoundingClientRect();
        svg.setAttribute('width', rect.width);
        svg.setAttribute('height', rect.height);
        svg.setAttribute('viewBox', `${-rect.width / 2} ${-rect.height / 2} ${rect.width} ${rect.height}`);
    };
    sizeSelf();
    const ro = new ResizeObserver(sizeSelf);
    ro.observe(stage);

    // -- Force step ----------------------------------------------------------
    function step(dt) {
        // Pairwise repulsion (O(n^2)). Fine for blog-sized graphs.
        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                let dx = b.x - a.x;
                let dy = b.y - a.y;
                let d2 = dx * dx + dy * dy;
                if (d2 < 0.01) {
                    dx = (Math.random() - 0.5) * 0.1;
                    dy = (Math.random() - 0.5) * 0.1;
                    d2 = dx * dx + dy * dy + 0.01;
                }
                const inv = 1 / d2;
                const d = Math.sqrt(d2);
                const f = sim.repulsion * inv;
                const fx = (dx / d) * f;
                const fy = (dy / d) * f;
                if (!a.pinned) {
                    a.vx -= fx;
                    a.vy -= fy;
                }
                if (!b.pinned) {
                    b.vx += fx;
                    b.vy += fy;
                }
            }
        }

        // Springs along links.
        for (const l of links) {
            const dx = l.target.x - l.source.x;
            const dy = l.target.y - l.source.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const f = sim.springK * (d - sim.springLength) * l.weight;
            const fx = (dx / d) * f;
            const fy = (dy / d) * f;
            if (!l.source.pinned) {
                l.source.vx += fx;
                l.source.vy += fy;
            }
            if (!l.target.pinned) {
                l.target.vx -= fx;
                l.target.vy -= fy;
            }
        }

        // Gravity toward origin (camera centre).
        for (const n of nodes) {
            if (n.pinned) continue;
            n.vx -= n.x * sim.gravity;
            n.vy -= n.y * sim.gravity;
        }

        // Integrate + damp.
        for (const n of nodes) {
            if (n.pinned) continue;
            n.vx *= sim.damping;
            n.vy *= sim.damping;
            n.x += n.vx * dt;
            n.y += n.vy * dt;
        }

        alpha *= 0.985;
    }

    function applyTransform() {
        root.setAttribute('transform', `translate(${cam.x} ${cam.y}) scale(${cam.zoom})`);
    }

    function paint() {
        for (const n of nodes) {
            n.el.setAttribute('transform', `translate(${n.x} ${n.y})`);
        }
        for (const l of links) {
            l.el.setAttribute('x1', l.source.x);
            l.el.setAttribute('y1', l.source.y);
            l.el.setAttribute('x2', l.target.x);
            l.el.setAttribute('y2', l.target.y);
        }
    }

    let lastT = performance.now();
    function tick(now) {
        const dt = Math.min(2, (now - lastT) / 16);
        lastT = now;
        if (alpha > 0.001 || dragNode) {
            step(dt);
        }
        paint();
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function reheat(level = 1) {
        alpha = Math.max(alpha, level);
    }

    applyTransform();

    // -- Hover focus ---------------------------------------------------------
    function setHover(id) {
        if (!id) {
            stage.classList.remove('is-focused');
            for (const n of nodes) n.el.classList.remove('is-dim', 'is-active');
            for (const l of links) l.el.classList.remove('is-dim', 'is-active');
            return;
        }
        const focus = neighbours.get(id) || new Set([id]);
        stage.classList.add('is-focused');
        for (const n of nodes) {
            n.el.classList.toggle('is-active', n.id === id);
            n.el.classList.toggle('is-dim', !focus.has(n.id));
        }
        for (const l of links) {
            const onPath = l.source.id === id || l.target.id === id;
            l.el.classList.toggle('is-active', onPath);
            l.el.classList.toggle('is-dim', !onPath);
        }
    }

    nodeLayer.addEventListener('mouseover', (e) => {
        const g = e.target.closest('.graph-node');
        if (!g) return;
        setHover(g.getAttribute('data-id'));
    });
    nodeLayer.addEventListener('mouseout', (e) => {
        if (!nodeLayer.contains(e.relatedTarget)) setHover(null);
    });

    // -- Drag (nodes) and pan (background) -----------------------------------
    let dragNode = null;
    let dragStart = null; // {x, y, mx, my} for nodes, or {camX, camY, mx, my} for pan
    let panMode = false;
    let pointerMoved = false;

    const screenToWorld = (sx, sy) => {
        const rect = svg.getBoundingClientRect();
        const x = sx - rect.left - rect.width / 2;
        const y = sy - rect.top - rect.height / 2;
        return { x: (x - cam.x) / cam.zoom, y: (y - cam.y) / cam.zoom };
    };

    svg.addEventListener('pointerdown', (e) => {
        const g = e.target.closest('.graph-node');
        pointerMoved = false;
        if (g) {
            const id = g.getAttribute('data-id');
            const n = idMap.get(id);
            if (!n) return;
            dragNode = n;
            n.pinned = true;
            const w = screenToWorld(e.clientX, e.clientY);
            dragStart = { offsetX: n.x - w.x, offsetY: n.y - w.y };
            svg.setPointerCapture(e.pointerId);
            stage.classList.add('is-dragging-node');
            reheat(0.6);
        } else {
            panMode = true;
            dragStart = { camX: cam.x, camY: cam.y, mx: e.clientX, my: e.clientY };
            svg.setPointerCapture(e.pointerId);
            stage.classList.add('is-dragging-bg');
        }
    });

    svg.addEventListener('pointermove', (e) => {
        if (dragNode) {
            const w = screenToWorld(e.clientX, e.clientY);
            dragNode.x = w.x + dragStart.offsetX;
            dragNode.y = w.y + dragStart.offsetY;
            dragNode.vx = 0;
            dragNode.vy = 0;
            pointerMoved = true;
            reheat(0.4);
        } else if (panMode) {
            cam.x = dragStart.camX + (e.clientX - dragStart.mx);
            cam.y = dragStart.camY + (e.clientY - dragStart.my);
            applyTransform();
            pointerMoved = true;
        }
    });

    function endPointer(e) {
        if (dragNode) {
            // If the user barely moved the pointer, treat as click → navigate.
            if (!pointerMoved) {
                const url = dragNode.el.getAttribute('data-url');
                if (url) window.location.href = url;
            }
            dragNode.pinned = false;
            dragNode = null;
            stage.classList.remove('is-dragging-node');
            reheat(0.5);
        }
        if (panMode) {
            panMode = false;
            stage.classList.remove('is-dragging-bg');
        }
        try { svg.releasePointerCapture(e.pointerId); } catch {}
    }
    svg.addEventListener('pointerup', endPointer);
    svg.addEventListener('pointercancel', endPointer);

    // -- Wheel zoom (around cursor) ------------------------------------------
    svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        const mx = e.clientX - rect.left - rect.width / 2;
        const my = e.clientY - rect.top - rect.height / 2;
        const factor = Math.exp(-e.deltaY * 0.0015);
        const newZoom = Math.max(0.25, Math.min(4, cam.zoom * factor));
        // Preserve world point under cursor.
        cam.x = mx - (mx - cam.x) * (newZoom / cam.zoom);
        cam.y = my - (my - cam.y) * (newZoom / cam.zoom);
        cam.zoom = newZoom;
        applyTransform();
    }, { passive: false });

    // -- Keyboard accessibility ----------------------------------------------
    nodeLayer.addEventListener('click', (e) => {
        const g = e.target.closest('.graph-node');
        if (!g) return;
        const url = g.getAttribute('data-url');
        if (url && !pointerMoved) window.location.href = url;
    });
})();
