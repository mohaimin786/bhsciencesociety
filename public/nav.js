// nav.js - Complete Navigation Handler

document.addEventListener('DOMContentLoaded', function () {
    console.log('Navigation script loaded');
    
    // Initialize hamburger menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger clicked');
            this.classList.toggle('active');
            navLinks.classList.toggle('show');
        });
        
        // Close menu when clicking on a nav link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navLinks.classList.remove('show');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar') && window.innerWidth <= 992) {
                hamburgerBtn.classList.remove('active');
                navLinks.classList.remove('show');
            }
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
        const navLinksEl = document.getElementById('navLinks');
        
        // Remove existing auth buttons from both desktop and mobile
        removeAuthButtons();
        
        if (isLoggedIn && token) {
            console.log('User is logged in, showing auth buttons');
            
            // Hide register/login links from main nav
            if (registerLink) registerLink.closest('li').style.display = 'none';
            if (loginLink) loginLink.closest('li').style.display = 'none';
            
            // Create desktop auth buttons
            createDesktopAuthButtons();
            
            // Add auth items to mobile navigation
            if (navLinksEl) {
                addMobileAuthItems(navLinksEl);
            }
            
        } else {
            console.log('User is not logged in, showing login/register');
            
            // Show register/login links in main nav
            if (registerLink) registerLink.closest('li').style.display = 'block';
            if (loginLink) loginLink.closest('li').style.display = 'block';
        }
        
        // Handle responsive behavior
        handleResponsive();
    }
    
    function removeAuthButtons() {
        // Remove desktop auth container
        const existingContainer = document.getElementById('auth-buttons');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Remove mobile auth items
        const dashboardNavItem = document.getElementById('dashboard-nav-item');
        const logoutNavItem = document.getElementById('logout-nav-item');
        if (dashboardNavItem) dashboardNavItem.remove();
        if (logoutNavItem) logoutNavItem.remove();
    }
    
    function createDesktopAuthButtons() {
        const authContainer = document.createElement('div');
        authContainer.id = 'auth-buttons';
        authContainer.className = 'desktop-auth-buttons';
        authContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1001;
            align-items: center;
            transition: all 0.3s ease;
        `;
        
        // Dashboard button
        const dashboardBtn = document.createElement('a');
        dashboardBtn.href = 'dashboard.html';
        dashboardBtn.className = 'dashboard-btn';
        dashboardBtn.textContent = 'Dashboard';
        dashboardBtn.style.cssText = `
            background: linear-gradient(135deg, #00ffae, #0dc0de);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,255,174,0.3);
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            font-size: 13px;
            font-family: 'Orbitron', sans-serif;
        `;
        
        dashboardBtn.addEventListener('mouseover', () => {
            dashboardBtn.style.transform = 'translateY(-2px)';
            dashboardBtn.style.boxShadow = '0 4px 12px rgba(0,255,174,0.5)';
        });
        dashboardBtn.addEventListener('mouseout', () => {
            dashboardBtn.style.transform = 'translateY(0)';
            dashboardBtn.style.boxShadow = '0 2px 8px rgba(0,255,174,0.3)';
        });
        
        // Logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.cssText = `
            background: linear-gradient(135deg, #ff5c5c, #ff2e2e);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(255,92,92,0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 13px;
            font-family: 'Orbitron', sans-serif;
        `;
        
        logoutBtn.addEventListener('mouseover', () => {
            logoutBtn.style.transform = 'translateY(-2px)';
            logoutBtn.style.boxShadow = '0 4px 12px rgba(255,92,92,0.5)';
        });
        logoutBtn.addEventListener('mouseout', () => {
            logoutBtn.style.transform = 'translateY(0)';
            logoutBtn.style.boxShadow = '0 2px 8px rgba(255,92,92,0.3)';
        });
        
        // Logout functionality
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            handleLogout();
        });
        
        authContainer.appendChild(dashboardBtn);
        authContainer.appendChild(logoutBtn);
        document.body.appendChild(authContainer);
    }
    
    function addMobileAuthItems(navLinksEl) {
        // Add dashboard to mobile nav
        const dashboardNavItem = document.createElement('li');
        dashboardNavItem.id = 'dashboard-nav-item';
        dashboardNavItem.innerHTML = '<a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>';
        
        // Add logout to mobile nav
        const logoutNavItem = document.createElement('li');
        logoutNavItem.id = 'logout-nav-item';
        logoutNavItem.innerHTML = '<a href="#logout"><i class="fas fa-sign-out-alt"></i> Logout</a>';
        
        // Style mobile nav items
        const mobileNavStyle = `
            color: var(--text-dark);
            text-decoration: none;
            font-weight: 600;
            padding: 8px 14px;
            border-radius: 4px;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        `;
        
        dashboardNavItem.querySelector('a').style.cssText = mobileNavStyle;
        logoutNavItem.querySelector('a').style.cssText = mobileNavStyle;
        
        // Add logout functionality to mobile
        logoutNavItem.querySelector('a').addEventListener('click', function (e) {
            e.preventDefault();
            handleLogout();
        });
        
        // Insert before contact link (or at the end)
        const contactLink = navLinksEl.querySelector('a[href="#contact"]');
        if (contactLink) {
            navLinksEl.insertBefore(dashboardNavItem, contactLink.parentElement);
            navLinksEl.insertBefore(logoutNavItem, contactLink.parentElement);
        } else {
            navLinksEl.appendChild(dashboardNavItem);
            navLinksEl.appendChild(logoutNavItem);
        }
        
        // Apply hover effects that match other nav items
        [dashboardNavItem, logoutNavItem].forEach(item => {
            const link = item.querySelector('a');
            
            // Create the before pseudo-element effect
            link.addEventListener('mouseenter', () => {
                link.style.color = 'var(--primary)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.color = 'var(--text-dark)';
            });
        });
    }
    
    function handleLogout() {
        console.log('Logout initiated');
        localStorage.removeItem('bhss_token');
        localStorage.removeItem('isLoggedIn');
        
        showNotification('success', 'Logged out successfully');
        
        // Close mobile menu if open
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const navLinks = document.getElementById('navLinks');
        if (hamburgerBtn && navLinks) {
            hamburgerBtn.classList.remove('active');
            navLinks.classList.remove('show');
        }
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
    
    function handleResponsive() {
        const authContainer = document.getElementById('auth-buttons');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const token = localStorage.getItem('bhss_token');
        
        function updateVisibility() {
            if (window.innerWidth <= 992) {
                // Mobile view - hide desktop auth buttons
                if (authContainer) {
                    authContainer.style.display = 'none';
                }
            } else {
                // Desktop view - show desktop auth buttons if logged in
                if (authContainer && isLoggedIn && token) {
                    authContainer.style.display = 'flex';
                }
            }
        }
        
        updateVisibility();
        
        // Listen for window resize
        window.removeEventListener('resize', updateVisibility);
        window.addEventListener('resize', updateVisibility);
    }
    
    // Notification helper
    function showNotification(type, message, duration = 3000) {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
        
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
        
        // Style the notification
        notification.style.cssText = `
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
        `;
        
        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            margin-left: auto;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        container.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Close functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove
        if (duration) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.opacity = '0';
                    notification.style.transform = 'translateX(100px)';
                    setTimeout(() => notification.remove(), 300);
                }
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
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
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

// Expose updateNavigation globally for other scripts
window.updateNavigation = function() {
    const event = new CustomEvent('updateNavigation');
    document.dispatchEvent(event);
};

console.log('nav.js loaded successfully');
