// nav.js - Complete Navigation Handler
document.addEventListener('DOMContentLoaded', function () {
    console.log('Navigation script loaded');

    // Initialize hamburger menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('navLinks');

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', function () {
            this.classList.toggle('active');
            navLinks.classList.toggle('show');
        });
    }

    // Update navigation based on login state
    function updateNavigation() {
        console.log('Updating navigation state');

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const token = localStorage.getItem('bhss_token');
        console.log(`Current auth state: isLoggedIn=${isLoggedIn}, tokenExists=${!!token}`);

        const registerLink = document.querySelector('a[href="register.html"]');
        const loginLink = document.querySelector('a[href="login.html"]');
        let logoutLink = document.querySelector('a[href="#logout"]');
        let dashboardLink = document.querySelector('a[href="dashboard.html"]');

        // Create a container for auth buttons if it doesn't exist
        let authContainer = document.getElementById('auth-buttons');
        if (!authContainer) {
            authContainer = document.createElement('div');
            authContainer.id = 'auth-buttons';
            authContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                display: flex;
                gap: 10px;
                z-index: 1000;
                align-items: center;
            `;
            document.body.appendChild(authContainer);
        }

        // Create dashboard link if logged in and doesn't exist
        if ((isLoggedIn || token) && !dashboardLink) {
            console.log('Creating dashboard link');
            const dashboardBtn = document.createElement('a');
            dashboardBtn.href = 'dashboard.html';
            dashboardBtn.className = 'dashboard-btn';
            dashboardBtn.textContent = 'Dashboard';
            dashboardBtn.id = 'dashboard-link';
            
            // Style dashboard button
            dashboardBtn.style.cssText = `
                background: linear-gradient(135deg, #00ffae, #0dc0de);
                color: white;
                padding: 10px 18px;
                border-radius: 25px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0,255,174,0.4);
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                font-size: 14px;
            `;
            
            dashboardBtn.addEventListener('mouseover', () => {
                dashboardBtn.style.transform = 'scale(1.05)';
                dashboardBtn.style.boxShadow = '0 6px 15px rgba(0,255,174,0.6)';
            });
            dashboardBtn.addEventListener('mouseout', () => {
                dashboardBtn.style.transform = 'scale(1)';
                dashboardBtn.style.boxShadow = '0 4px 12px rgba(0,255,174,0.4)';
            });
            
            authContainer.appendChild(dashboardBtn);
            dashboardLink = dashboardBtn;
        }

        // Create logout link if it doesn't exist
        if ((isLoggedIn || token) && !logoutLink) {
            console.log('Creating logout link');
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#logout';
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.id = 'logout-link';

            // Style logout button
            logoutBtn.style.cssText = `
                background: linear-gradient(135deg, #ff5c5c, #ff2e2e);
                color: white;
                padding: 10px 18px;
                border-radius: 25px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(255,92,92,0.4);
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                font-size: 14px;
            `;
            
            logoutBtn.addEventListener('mouseover', () => {
                logoutBtn.style.transform = 'scale(1.05)';
                logoutBtn.style.boxShadow = '0 6px 15px rgba(255,92,92,0.6)';
            });
            logoutBtn.addEventListener('mouseout', () => {
                logoutBtn.style.transform = 'scale(1)';
                logoutBtn.style.boxShadow = '0 4px 12px rgba(255,92,92,0.4)';
            });

            // Logout click handler
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('Logout clicked');
                localStorage.removeItem('bhss_token');
                localStorage.removeItem('isLoggedIn');
                showNotification('success', 'Logged out successfully');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            });
            
            authContainer.appendChild(logoutBtn);
            logoutLink = logoutBtn;
        }

        // Update visibility
        if (isLoggedIn && token) {
            // Hide register/login links from main nav
            if (registerLink) registerLink.closest('li').style.display = 'none';
            if (loginLink) loginLink.closest('li').style.display = 'none';
            
            // Show auth buttons
            if (authContainer) authContainer.style.display = 'flex';
            if (logoutLink) logoutLink.style.display = 'inline-block';
            if (dashboardLink) dashboardLink.style.display = 'inline-block';
        } else {
            // Show register/login links in main nav
            if (registerLink) registerLink.closest('li').style.display = 'block';
            if (loginLink) loginLink.closest('li').style.display = 'block';
            
            // Hide auth buttons
            if (authContainer) authContainer.style.display = 'none';
        }

        // Responsive behavior for mobile
        function handleResponsive() {
            const navLinksEl = document.getElementById('navLinks');
            
            if (window.innerWidth <= 768) {
                // Mobile: Hide fixed container and add buttons to nav
                if (authContainer) {
                    authContainer.style.display = 'none';
                }
                
                // Add dashboard to nav if logged in
                if ((isLoggedIn || token) && dashboardLink) {
                    let dashboardNavItem = document.getElementById('dashboard-nav-item');
                    if (!dashboardNavItem && navLinksEl) {
                        dashboardNavItem = document.createElement('li');
                        dashboardNavItem.id = 'dashboard-nav-item';
                        dashboardNavItem.innerHTML = '<a href="dashboard.html">Dashboard</a>';
                        navLinksEl.appendChild(dashboardNavItem);
                        
                        // Apply normal nav link styles
                        const dashboardNavLink = dashboardNavItem.querySelector('a');
                        dashboardNavLink.style.cssText = `
                            color: inherit;
                            text-decoration: none;
                            padding: 10px 0;
                            display: block;
                            border-bottom: 1px solid rgba(255,255,255,0.1);
                        `;
                    }
                }
                
                // Add logout to nav if logged in
                if ((isLoggedIn || token) && logoutLink) {
                    let logoutNavItem = document.getElementById('logout-nav-item');
                    if (!logoutNavItem && navLinksEl) {
                        logoutNavItem = document.createElement('li');
                        logoutNavItem.id = 'logout-nav-item';
                        logoutNavItem.innerHTML = '<a href="#logout">Logout</a>';
                        navLinksEl.appendChild(logoutNavItem);
                        
                        // Apply normal nav link styles
                        const logoutNavLink = logoutNavItem.querySelector('a');
                        logoutNavLink.style.cssText = `
                            color: inherit;
                            text-decoration: none;
                            padding: 10px 0;
                            display: block;
                            border-bottom: 1px solid rgba(255,255,255,0.1);
                        `;
                        
                        // Add logout functionality
                        logoutNavLink.addEventListener('click', function (e) {
                            e.preventDefault();
                            console.log('Logout clicked');
                            localStorage.removeItem('bhss_token');
                            localStorage.removeItem('isLoggedIn');
                            showNotification('success', 'Logged out successfully');
                            setTimeout(() => {
                                window.location.href = 'index.html';
                            }, 1000);
                        });
                    }
                }
            } else {
                // Desktop: Show fixed container and remove from nav
                if (authContainer && (isLoggedIn || token)) {
                    authContainer.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        display: flex;
                        gap: 10px;
                        z-index: 1000;
                        align-items: center;
                    `;
                }
                
                // Remove from nav menu
                const dashboardNavItem = document.getElementById('dashboard-nav-item');
                const logoutNavItem = document.getElementById('logout-nav-item');
                if (dashboardNavItem) dashboardNavItem.remove();
                if (logoutNavItem) logoutNavItem.remove();
                
                // Reset button sizes for desktop
                if (dashboardLink) {
                    dashboardLink.style.padding = '10px 18px';
                    dashboardLink.style.fontSize = '14px';
                }
                if (logoutLink) {
                    logoutLink.style.padding = '10px 18px';
                    logoutLink.style.fontSize = '14px';
                }
            }
        }

        // Apply responsive styles
        handleResponsive();
        
        // Listen for window resize
        window.addEventListener('resize', handleResponsive);
    }

    // Notification helper (matches your existing notification system)
    function showNotification(type, message, duration = 3000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icons = {
            error: 'fas fa-times-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <i class="${icons[type]} notification-icon"></i>
            <div class="notification-content">${message}</div>
            <button class="notification-close">&times;</button>
        `;

        container.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        if (duration) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    }

    // Watch for auth changes
    window.addEventListener('storage', function (e) {
        if (e.key === 'isLoggedIn' || e.key === 'bhss_token') {
            console.log('Auth state changed - updating navigation');
            updateNavigation();
        }
    });

    // Initial update
    updateNavigation();

    // Also update after potential login (for single page navigation)
    if (window.performance && performance.navigation.type === 1) {
        console.log('Page was reloaded - checking auth state');
        updateNavigation();
    }
});

// Add this to ensure the script is properly loaded
console.log('nav.js loaded successfully');
