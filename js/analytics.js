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

    // Track page view
    async function trackPageView() {
        try {
            const data = {
                page: window.location.pathname,
                referrer: document.referrer || 'direct',
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                sessionId: getSessionId(),
                timestamp: new Date().toISOString()
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
