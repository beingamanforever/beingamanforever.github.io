// Vercel Serverless Function for Visitor Tracking
// File: api/track.js

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const { page, referrer, userAgent, screenResolution, sessionId } = req.body;

        // Get IP and hash it for privacy
        const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

        // Get location data from IP (using free ipapi.co)
        let locationData = {};
        try {
            const geoResponse = await fetch(`https://ipapi.co/${ip.split(',')[0].trim()}/json/`);
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                locationData = {
                    country: geoData.country_name,
                    city: geoData.city,
                    latitude: geoData.latitude,
                    longitude: geoData.longitude
                };
            }
        } catch (geoError) {
            console.error('Geolocation error:', geoError);
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
