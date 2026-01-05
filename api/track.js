// Vercel Serverless Function for Visitor Tracking
// File: api/track.js

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_WINDOW = 30;

function isRateLimitedInMemory(ipHash) {
    // Best-effort limiter for environments without a DB-readable key.
    // Note: serverless instances may not share memory; this is still useful against bursts.
    const now = Date.now();
    const bucket = Math.floor(now / RATE_LIMIT_WINDOW_MS);
    const key = `${ipHash}:${bucket}`;

    const store = globalThis.__aman_rateLimitStore || (globalThis.__aman_rateLimitStore = new Map());
    const current = store.get(key) || 0;
    const next = current + 1;
    store.set(key, next);

    // Opportunistic cleanup of old buckets (keep last ~3 buckets)
    if (store.size > 5000) {
        const minBucketToKeep = bucket - 2;
        for (const k of store.keys()) {
            const parts = String(k).split(':');
            const b = Number(parts[parts.length - 1]);
            if (Number.isFinite(b) && b < minBucketToKeep) store.delete(k);
        }
    }

    return next > RATE_LIMIT_MAX_PER_WINDOW;
}

export default async function handler(req, res) {
    // CORS headers - Set first before any other logic
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
            return res.status(500).json({ error: 'Server misconfigured' });
        }

        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
        );

        const { page, referrer, userAgent, screenResolution, sessionId, geo } = req.body;

        // Get IP and hash it for privacy
        const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';
        const cleanIp = ip.split(',')[0].trim();
        const ipHash = crypto.createHash('sha256').update(cleanIp).digest('hex');

        // Rate limiting: prefer DB-backed (service role), otherwise in-memory best-effort.
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
            const { count, error: countError } = await supabase
                .from('visitors')
                .select('id', { count: 'exact', head: true })
                .eq('ip_hash', ipHash)
                .gte('timestamp', cutoff);

            if (!countError && typeof count === 'number' && count >= RATE_LIMIT_MAX_PER_WINDOW) {
                return res.status(429).json({ error: 'Rate limited' });
            }
        } else {
            if (isRateLimitedInMemory(ipHash)) {
                return res.status(429).json({ error: 'Rate limited' });
            }
        }

        // Prefer client GPS coords when provided (and plausibly valid), otherwise fall back to IP geolocation.
        const hasClientGeo = geo && typeof geo === 'object';
        const clientLat = hasClientGeo ? Number(geo.latitude) : NaN;
        const clientLng = hasClientGeo ? Number(geo.longitude) : NaN;
        const clientAcc = hasClientGeo && geo.accuracy !== null && geo.accuracy !== undefined ? Number(geo.accuracy) : null;
        const clientGeoValid = Number.isFinite(clientLat)
            && Number.isFinite(clientLng)
            && clientLat >= -90 && clientLat <= 90
            && clientLng >= -180 && clientLng <= 180;

        let locationData = {};
        let geoSource = null;
        let geoAccuracyM = null;

        if (clientGeoValid) {
            locationData = {
                latitude: clientLat,
                longitude: clientLng
            };
            geoSource = 'gps';
            if (clientAcc !== null && Number.isFinite(clientAcc) && clientAcc >= 0) {
                geoAccuracyM = Math.min(Math.round(clientAcc), 100000);
            }
        } else {
            // IP-based location (coarse)
            try {
                const geoResponse = await fetch(`https://ip-api.com/json/${cleanIp}?fields=status,country,city,lat,lon`);
                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    if (geoData.status === 'success') {
                        locationData = {
                            country: geoData.country,
                            city: geoData.city,
                            latitude: geoData.lat,
                            longitude: geoData.lon
                        };
                        geoSource = 'ip';
                    }
                }
            } catch (geoError) {
                console.error('Geolocation error:', geoError);
            }
        }

        // Parse user agent
        const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : /tablet/i.test(userAgent) ? 'Tablet' : 'Desktop';
        const browserMatch = userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera)\/[\d.]+/);
        const browser = browserMatch ? browserMatch[1] : 'Unknown';
        const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/);
        const os = osMatch ? osMatch[1] : 'Unknown';

        // Insert visitor data
        const { data, error } = await supabase
            .from('visitors')
            .insert([{
                page,
                referrer,
                user_agent: userAgent,
                country: locationData.country,
                city: locationData.city,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                geo_source: geoSource,
                geo_accuracy_m: geoAccuracyM,
                device_type: deviceType,
                browser,
                os,
                screen_resolution: screenResolution,
                session_id: sessionId,
                ip_hash: ipHash
            }]);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to track visitor' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Tracking error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
