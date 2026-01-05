(() => {
    'use strict';

    // Configuration
    const SUPABASE_URL = 'https://jmqhgcssvewlkswqymby.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcWhnY3NzdmV3bGtzd3F5bWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzU2ODksImV4cCI6MjA4MzExMTY4OX0.SxzCZpvBYQN41eI4C5acE_jIGL2z59GepffGv9150dM';

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error('Supabase client library not loaded');
        return;
    }

    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let currentPeriod = '24h';

    // Check authentication on load
    async function checkAuth() {
        const { data: { session } } = await sb.auth.getSession();
        if (session) {
            showDashboard();
            loadAnalytics();
        } else {
            showAuth();
        }
    }

    function showAuth() {
        const authContainer = document.getElementById('auth-container');
        const dashboardContainer = document.getElementById('dashboard-container');
        if (authContainer) authContainer.style.display = 'block';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
    }

    function showDashboard() {
        const authContainer = document.getElementById('auth-container');
        const dashboardContainer = document.getElementById('dashboard-container');
        if (authContainer) authContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'block';
    }

    // Sign in
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            const errorEl = document.getElementById('auth-error');

            try {
                const { error } = await sb.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                if (errorEl) {
                    errorEl.textContent = '> ACCESS GRANTED';
                    errorEl.style.color = '#00ff00';
                    errorEl.style.display = 'block';
                }

                setTimeout(() => {
                    showDashboard();
                    loadAnalytics();
                }, 800);
            } catch (error) {
                if (errorEl) {
                    errorEl.textContent = '> PERMISSION DENIED: ' + error.message;
                    errorEl.style.color = '#ff0000';
                    errorEl.style.display = 'block';
                    setTimeout(() => {
                        errorEl.style.display = 'none';
                    }, 3000);
                }
            }
        });
    }

    // Auto-focus password field after email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('password')?.focus();
            }
        });
    }

    // Sign out
    async function signOut() {
        await sb.auth.signOut();
        showAuth();
    }

    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }

    // Load analytics data
    async function loadAnalytics() {
        try {
            const cutoffTime = getCutoffTime(currentPeriod);

            const { data: visitors, error } = await sb
                .from('visitors')
                .select('*')
                .gte('timestamp', cutoffTime)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            const totalVisits = visitors.length;
            const uniqueSessions = new Set(visitors.map(v => v.session_id)).size;
            const countries = new Set(visitors.map(v => v.country).filter(Boolean)).size;

            const today = new Date().toISOString().split('T')[0];
            const todayVisits = visitors.filter(v => v.timestamp.startsWith(today)).length;

            const totalVisitsEl = document.getElementById('total-visits');
            const uniqueSessionsEl = document.getElementById('unique-sessions');
            const countriesEl = document.getElementById('countries');
            const todayVisitsEl = document.getElementById('today-visits');

            if (totalVisitsEl) totalVisitsEl.textContent = totalVisits;
            if (uniqueSessionsEl) uniqueSessionsEl.textContent = uniqueSessions;
            if (countriesEl) countriesEl.textContent = countries;
            if (todayVisitsEl) todayVisitsEl.textContent = todayVisits;

            const tbody = document.getElementById('visitors-tbody');
            if (tbody) {
                tbody.innerHTML = visitors.slice(0, 50).map(v => `
                    <tr>
                        <td>${new Date(v.timestamp).toLocaleString()}</td>
                        <td>${v.page}</td>
                        <td>${(v.city || v.country)
                            ? `${v.city || 'Unknown'}, ${v.country || 'Unknown'}`
                            : (v.latitude && v.longitude ? `${Number(v.latitude).toFixed(6)}, ${Number(v.longitude).toFixed(6)}` : 'Unknown')}${v.geo_source ? ` (${String(v.geo_source).toLowerCase()})` : ''}${(v.geo_accuracy_m !== null && v.geo_accuracy_m !== undefined) ? ` ±${v.geo_accuracy_m}m` : ''}</td>
                        <td>${v.device_type || 'Unknown'}</td>
                        <td>${v.browser || 'Unknown'}</td>
                    </tr>
                `).join('');
            }

            updateMap(visitors);

        } catch (error) {
            console.error('Failed to load analytics:', error);
            const tbody = document.getElementById('visitors-tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr><td colspan="5" class="error-message">Failed to load analytics data</td></tr>
                `;
            }
        }
    }

    function getCutoffTime(period) {
        const now = new Date();
        switch (period) {
            case '24h':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            default:
                return '2000-01-01T00:00:00Z';
        }
    }

    // Map
    let map;
    let markerLayer;

    function initMap() {
        map = L.map('visitor-map').setView([20, 0], 2);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        markerLayer = L.layerGroup().addTo(map);
    }

    function updateMap(visitors) {
        if (!map) initMap();

        markerLayer.clearLayers();

        const rootStyles = getComputedStyle(document.documentElement);
        const gpsFill = rootStyles.getPropertyValue('--walter-green').trim() || '#6b8cff';
        const ipFill = '#6b8cff';

        const locationCounts = {};
        visitors.forEach(v => {
            if (v.latitude && v.longitude) {
                const lat = Number(v.latitude);
                const lon = Number(v.longitude);
                if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

                const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
                locationCounts[key] = locationCounts[key] || {
                    lat,
                    lon,
                    city: v.city,
                    country: v.country,
                    count: 0,
                    sources: new Set(),
                    bestAccuracyM: null
                };

                locationCounts[key].count++;

                if (v.geo_source) {
                    locationCounts[key].sources.add(String(v.geo_source).toLowerCase());
                }

                if (v.geo_accuracy_m !== null && v.geo_accuracy_m !== undefined) {
                    const acc = Number(v.geo_accuracy_m);
                    if (Number.isFinite(acc)) {
                        if (locationCounts[key].bestAccuracyM === null || acc < locationCounts[key].bestAccuracyM) {
                            locationCounts[key].bestAccuracyM = acc;
                        }
                    }
                }
            }
        });

        Object.values(locationCounts).forEach(loc => {
            const hasGps = loc.sources.has('gps');
            const sourcesLabel = loc.sources.size ? Array.from(loc.sources).sort().join(', ') : 'unknown';
            const accLine = loc.bestAccuracyM !== null ? `<br>Accuracy: ±${loc.bestAccuracyM}m` : '';

            const marker = L.circleMarker([loc.lat, loc.lon], {
                radius: Math.min(5 + Math.log(loc.count) * 3, 20),
                fillColor: hasGps ? gpsFill : ipFill,
                color: '#ffffff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            }).addTo(markerLayer);

            marker.bindPopup(`
                <strong>${loc.city || 'Unknown'}, ${loc.country || 'Unknown'}</strong><br>
                Coord: ${Number(loc.lat).toFixed(6)}, ${Number(loc.lon).toFixed(6)}<br>
                Source: ${sourcesLabel}${accLine}<br>
                ${loc.count} visit${loc.count > 1 ? 's' : ''}
            `);
        });
    }

    // Period filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period;
            loadAnalytics();
        });
    });

    checkAuth();
})();
