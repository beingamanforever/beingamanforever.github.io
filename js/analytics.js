// Client-side Analytics Tracker
// Sends visitor data to tracking API

(function() {
    'use strict';

    // Configuration
    const API_ENDPOINT = 'https://portfolio-psi-mauve-bbbl16b9ab.vercel.app/api/track';
    
    // Generate or retrieve session ID
    function getSessionId() {
        let sessionId = sessionStorage.getItem('visitor_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('visitor_session_id', sessionId);
        }
        return sessionId;
    }

    async function getGrantedGeolocation() {
        if (!navigator.geolocation) return null;

        // Do not trigger a permission prompt from analytics.
        if (navigator.permissions && navigator.permissions.query) {
            try {
                const status = await navigator.permissions.query({ name: 'geolocation' });
                if (status.state !== 'granted') return null;
            } catch {
                return null;
            }
        } else {
            return null;
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = pos && pos.coords;
                    if (!coords) return resolve(null);
                    resolve({
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        accuracy: Number.isFinite(coords.accuracy) ? Math.round(coords.accuracy) : null
                    });
                },
                () => resolve(null),
                {
                    enableHighAccuracy: true,
                    maximumAge: 5 * 60 * 1000,
                    timeout: 2500
                }
            );
        });
    }

    // Track page view
    async function trackPageView() {
        try {
            const geo = await getGrantedGeolocation();
            const data = {
                page: window.location.pathname,
                referrer: document.referrer || 'direct',
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                sessionId: getSessionId(),
                timestamp: new Date().toISOString(),
                geo
            };

            // Send data to API
            await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                // Use sendBeacon as fallback for page unload
                keepalive: true
            });

        } catch (error) {
            // Silently fail - don't break the site
            console.debug('Analytics tracking failed:', error);
        }
    }

    // Track on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }

    // Track single-page navigation (if you add SPA routing later)
    let lastPath = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            trackPageView();
        }
    }, 1000);

})();
