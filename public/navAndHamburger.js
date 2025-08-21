// Simple fixed navigation script

document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburgerBtn && navLinks) {
        // Main hamburger click handler
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = this.classList.contains('active');
            if (isActive) {
                this.classList.remove('active');
                navLinks.classList.remove('show');
                document.body.style.overflow = '';
            } else {
                this.classList.add('active');
                navLinks.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
        
        // Close menu when clicking nav links
        const navLinkElements = document.querySelectorAll('.nav-links a');
        navLinkElements.forEach(link => {
            link.addEventListener('click', function() {
                hamburgerBtn.classList.remove('active');
                navLinks.classList.remove('show');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            const navbar = document.querySelector('.navbar');
            if (!navbar.contains(e.target) && window.innerWidth <= 992) {
                if (hamburgerBtn.classList.contains('active')) {
                    hamburgerBtn.classList.remove('active');
                    navLinks.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992) {
                if (hamburgerBtn.classList.contains('active')) {
                    hamburgerBtn.classList.remove('active');
                    navLinks.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }
        });
    }
    
    // Simple scroll effect - just add/remove scrolled class
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Auth state management
    function updateNavigation() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const token = localStorage.getItem('bhss_token');
        
        const registerLink = document.querySelector('a[href="register.html"]');
        const loginLink = document.querySelector('a[href="login.html"]');
        
        // Remove existing auth buttons
        const existingContainer = document.getElementById('auth-buttons');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        const dashboardNavItem = document.getElementById('dashboard-nav-item');
        const logoutNavItem = document.getElementById('logout-nav-item');
        if (dashboardNavItem) dashboardNavItem.remove();
        if (logoutNavItem) logoutNavItem.remove();
        
        if (isLoggedIn && token) {
            // Hide register/login links
            if (registerLink) registerLink.closest('li').style.display = 'none';
            if (loginLink) loginLink.closest('li').style.display = 'none';
            
            // Create desktop auth buttons
            createDesktopAuthButtons();
            
            // Add mobile auth items
            const navLinksEl = document.getElementById('navLinks');
            if (navLinksEl) {
                addMobileAuthItems(navLinksEl);
            }
        } else {
            // Show register/login links
            if (registerLink) registerLink.closest('li').style.display = 'block';
            if (loginLink) loginLink.closest('li').style.display = 'block';
        }
        
        handleResponsive();
    }
    
    function createDesktopAuthButtons() {
        const authContainer = document.createElement('div');
        authContainer.id = 'auth-buttons';
        authContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1001;
        `;
        
        const dashboardBtn = document.createElement('a');
        dashboardBtn.href = 'dashboard.html';
        dashboardBtn.textContent = 'Dashboard';
        dashboardBtn.style.cssText = `
            background: linear-gradient(135deg, #00ffae, #0dc0de);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            text-decoration: none;
            font-size: 13px;
        `;
        
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.cssText = `
            background: linear-gradient(135deg, #ff5c5c, #ff2e2e);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            font-size: 13px;
        `;
        
        logoutBtn.addEventListener('click', handleLogout);
        
        authContainer.appendChild(dashboardBtn);
        authContainer.appendChild(logoutBtn);
        document.body.appendChild(authContainer);
    }
    
    function addMobileAuthItems(navLinksEl) {
        const dashboardNavItem = document.createElement('li');
        dashboardNavItem.id = 'dashboard-nav-item';
        dashboardNavItem.innerHTML = '<a href="dashboard.html">Dashboard</a>';
        
        const logoutNavItem = document.createElement('li');
        logoutNavItem.id = 'logout-nav-item';
        logoutNavItem.innerHTML = '<a href="#logout">Logout</a>';
        
        logoutNavItem.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
        
        const contactLink = navLinksEl.querySelector('a[href="#contact"]');
        if (contactLink) {
            navLinksEl.insertBefore(dashboardNavItem, contactLink.parentElement);
            navLinksEl.insertBefore(logoutNavItem, contactLink.parentElement);
        } else {
            navLinksEl.appendChild(dashboardNavItem);
            navLinksEl.appendChild(logoutNavItem);
        }
    }
    
    function handleLogout() {
        localStorage.removeItem('bhss_token');
        localStorage.removeItem('isLoggedIn');
        
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const navLinks = document.getElementById('navLinks');
        if (hamburgerBtn && navLinks) {
            hamburgerBtn.classList.remove('active');
            navLinks.classList.remove('show');
        }
        
        window.location.href = 'index.html';
    }
    
    function handleResponsive() {
        const authContainer = document.getElementById('auth-buttons');
        const dashboardNavItem = document.getElementById('dashboard-nav-item');
        const logoutNavItem = document.getElementById('logout-nav-item');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        function updateVisibility() {
            if (window.innerWidth <= 992) {
                // Mobile - hide desktop buttons, show mobile items
                if (authContainer) authContainer.style.display = 'none';
                if (isLoggedIn) {
                    if (dashboardNavItem) dashboardNavItem.style.display = 'block';
                    if (logoutNavItem) logoutNavItem.style.display = 'block';
                } else {
                    if (dashboardNavItem) dashboardNavItem.style.display = 'none';
                    if (logoutNavItem) logoutNavItem.style.display = 'none';
                }
            } else {
                // Desktop - show desktop buttons if logged in, hide mobile items
                if (authContainer && isLoggedIn) {
                    authContainer.style.display = 'flex';
                } else if (authContainer) {
                    authContainer.style.display = 'none';
                }
                if (dashboardNavItem) dashboardNavItem.style.display = 'none';
                if (logoutNavItem) logoutNavItem.style.display = 'none';
            }
        }
        
        updateVisibility();
        window.removeEventListener('resize', updateVisibility);
        window.addEventListener('resize', updateVisibility);
    }
    
    // Watch for auth changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'bhss_token') {
            updateNavigation();
        }
    });
    
    // Initial update
    updateNavigation();
});
