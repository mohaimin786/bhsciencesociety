// merged-navigation.js - Complete Navigation and Theme Handler - FIXED VERSION

document.addEventListener('DOMContentLoaded', function() {
    console.log('Merged navigation script loaded');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('navLinks');
    if (hamburgerBtn && navLinks) {
        console.log('Hamburger menu elements found, setting up event listeners');
        // Main hamburger click hand
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger menu toggled');
            // Toggle states
            const isActive = this.classList.contains('active');
            if (isActive) {
                // Close menu
                console.log('Closing hamburger menu');
                this.classList.remove('active');
                navLinks.classList.remove('show');
                document.body.style.overflow = ''; // Re-enable scroll
            } else {
                // Open menu
                console.log('Opening hamburger menu');
                this.classList.add('active');
                navLinks.classList.add('show');
                document.body.style.overflow = 'hidden'; // Prevent scroll
            }
        });
        // Close menu when clicking on any nav link
        const navLinkElements = document.querySelectorAll('.nav-links a');
        console.log(`Found ${navLinkElements.length} nav links`);
        navLinkElements.forEach(link => {
            link.addEventListener('click', function() {
                console.log('Nav link clicked, closing menu');
                hamburgerBtn.classList.remove('active');
                navLinks.classList.remove('show');
                document.body.style.overflow = '';
            });
        });
        // Close menu when clicking outside navbar
        document.addEventListener('click', function(e) {
            const navbar = document.querySelector('.navbar');
            if (!navbar.contains(e.target) && window.innerWidth <= 992) {
                if (hamburgerBtn.classList.contains('active')) {
                    console.log('Clicked outside navbar, closing menu');
                    hamburgerBtn.classList.remove('active');
                    navLinks.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }
        });
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992) {
                // Desktop view - ensure menu is closed and scroll is enabled
                if (hamburgerBtn.classList.contains('active')) {
                    console.log('Switching to desktop view, closing mobile menu');
                    hamburgerBtn.classList.remove('active');
                    navLinks.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }
        });
        // Prevent menu from closing when clicking inside nav-links
        navLinks.addEventListener('click', function(e) {
            // Only stop propagation if clicking on the menu itself, not on links
            if (e.target === navLinks || e.target.classList.contains('nav-links')) {
                e.stopPropagation();
            }
        });
    } else {

        console.error('Hamburger menu elements not found:', {

            hamburgerBtn: !!hamburgerBtn,

            navLinks: !!navLinks

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

        

        // Debug mobile auth items

        debugMobileAuthItems();

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

    

    // FIXED: Mobile auth items function

    function addMobileAuthItems(navLinksEl) {

        console.log('Adding mobile auth items');

        

        // Add dashboard to mobile nav

        const dashboardNavItem = document.createElement('li');

        dashboardNavItem.id = 'dashboard-nav-item';

        dashboardNavItem.className = 'mobile-auth-item';

        dashboardNavItem.innerHTML = '<a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>';

        

        // Add logout to mobile nav

        const logoutNavItem = document.createElement('li');

        logoutNavItem.id = 'logout-nav-item';

        logoutNavItem.className = 'mobile-auth-item';

        logoutNavItem.innerHTML = '<a href="#logout"><i class="fas fa-sign-out-alt"></i> Logout</a>';

        

        // Style mobile nav items - FIXED: Don't hide them by default

        const mobileNavStyle = `

            color: var(--text-dark);

            text-decoration: none;

            font-weight: 600;

            padding: 8px 14px;

            border-radius: 4px;

            transition: var(--transition);

            position: relative;

            overflow: hidden;

            display: flex;

            align-items: center;

            gap: 8px;

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

        

        console.log('Mobile auth items added successfully');

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

    

    // FIXED: Responsive handler

    function handleResponsive() {

        const authContainer = document.getElementById('auth-buttons');

        const dashboardNavItem = document.getElementById('dashboard-nav-item');

        const logoutNavItem = document.getElementById('logout-nav-item');

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        const token = localStorage.getItem('bhss_token');

        

        console.log('handleResponsive called', { 

            isLoggedIn, 

            token: !!token, 

            width: window.innerWidth,

            dashboardExists: !!dashboardNavItem,

            logoutExists: !!logoutNavItem

        });

        

        function updateVisibility() {

            if (window.innerWidth <= 992) {

                // Mobile view - hide desktop auth buttons, show mobile auth items

                if (authContainer) {

                    authContainer.style.display = 'none';

                }

                

                // FIXED: Show mobile auth items in hamburger menu if logged in

                if (isLoggedIn && token) {

                    if (dashboardNavItem) {

                        dashboardNavItem.style.display = 'block';

                        console.log('Showing dashboard nav item');

                    }

                    if (logoutNavItem) {

                        logoutNavItem.style.display = 'block';

                        console.log('Showing logout nav item');

                    }

                } else {

                    if (dashboardNavItem) dashboardNavItem.style.display = 'none';

                    if (logoutNavItem) logoutNavItem.style.display = 'none';

                }

            } else {

                // Desktop view - show desktop auth buttons if logged in, hide mobile items

                if (authContainer && isLoggedIn && token) {

                    authContainer.style.display = 'flex';

                } else if (authContainer) {

                    authContainer.style.display = 'none';

                }

                

                // Always hide mobile auth items on desktop

                if (dashboardNavItem) dashboardNavItem.style.display = 'none';

                if (logoutNavItem) logoutNavItem.style.display = 'none';

            }

        }

        

        updateVisibility();

        

        // Listen for window resize

        window.removeEventListener('resize', updateVisibility);

        window.addEventListener('resize', updateVisibility);

    }

    

    // Debug function

    function debugMobileAuthItems() {

        setTimeout(() => {

            const dashboardNavItem = document.getElementById('dashboard-nav-item');

            const logoutNavItem = document.getElementById('logout-nav-item');

            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            const navLinksEl = document.getElementById('navLinks');

            

            console.log('Debug mobile auth items:', {

                dashboardExists: !!dashboardNavItem,

                logoutExists: !!logoutNavItem,

                isLoggedIn,

                screenWidth: window.innerWidth,

                dashboardDisplay: dashboardNavItem ? window.getComputedStyle(dashboardNavItem).display : 'none',

                logoutDisplay: logoutNavItem ? window.getComputedStyle(logoutNavItem).display : 'none',

                navLinksChildren: navLinksEl ? navLinksEl.children.length : 0

            });

            

            if (dashboardNavItem) {

                console.log('Dashboard item parent:', dashboardNavItem.parentElement);

                console.log('Dashboard item HTML:', dashboardNavItem.outerHTML);

            }

            if (logoutNavItem) {

                console.log('Logout item parent:', logoutNavItem.parentElement);

                console.log('Logout item HTML:', logoutNavItem.outerHTML);

            }

        }, 100);

    }

    // =============================================

    // PARTICLE SYSTEM - Enhanced

    // =============================================

    function createParticles() {

        const particlesContainer = document.getElementById('particles-js');

        if (!particlesContainer) return;

        

        // Clear existing particles

        particlesContainer.innerHTML = '';

        

        const particleCount = Math.max(20, Math.floor(window.innerWidth / 15));

        console.log(`Creating ${particleCount} particles`);

        

        for (let i = 0; i < particleCount; i++) {

            const particle = document.createElement('div');

            particle.classList.add('particle');

            

            // Random size between 1px and 4px

            const size = Math.random() * 3 + 1;

            particle.style.width = `${size}px`;

            particle.style.height = `${size}px`;

            

            // Random position

            particle.style.left = `${Math.random() * 100}%`;

            particle.style.top = `${Math.random() * 100}%`;

            

            // Random animation duration and delay

            const duration = Math.random() * 20 + 15; // 15-35 seconds

            const delay = Math.random() * 10; // 0-10 seconds delay

            

            particle.style.animation = `float ${duration}s linear ${delay}s infinite`;

            

            // Random opacity

            particle.style.opacity = Math.random() * 0.7 + 0.3;

            

            // Add some variation in color

            const hue = Math.random() * 60 + 160; // Green to blue range

            particle.style.background = `hsla(${hue}, 70%, 60%, 0.6)`;

            particle.style.boxShadow = `0 0 ${size * 2}px hsla(${hue}, 70%, 60%, 0.8)`;

            

            particlesContainer.appendChild(particle);

        }

    }

    

    // Initialize particles

    createParticles();

    

    // Recreate particles on window resize

    let resizeTimeout;

    window.addEventListener('resize', function() {

        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(createParticles, 250);

    });

    // =============================================

    // NAVBAR SCROLL EFFECT - Enhanced

    // =============================================

    let lastScrollY = 0;

  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    
    lastScrollY = currentScrollY;
});

    // =============================================

    // FLOATING ICONS ENHANCEMENT

    // =============================================

    function enhanceFloatingIcons() {

        const icons = document.querySelectorAll('.floating-icons .icon');

        

        icons.forEach((icon, index) => {

            // Add mouse interaction

            icon.addEventListener('mouseenter', function() {

                this.style.animationPlayState = 'paused';

                this.style.transform = 'scale(1.5) rotate(180deg)';

                this.style.filter = 'brightness(1.5) drop-shadow(0 0 10px rgba(0,255,174,0.8))';

            });

            

            icon.addEventListener('mouseleave', function() {

                this.style.animationPlayState = 'running';

                this.style.transform = '';

                this.style.filter = '';

            });

            

            // Add random rotation during animation

            const randomRotation = Math.random() * 360;

            icon.style.setProperty('--random-rotation', `${randomRotation}deg`);

        });

    }

    

    // Initialize floating icons enhancements

    setTimeout(enhanceFloatingIcons, 1000);

    // =============================================

    // SMOOTH SCROLLING FOR ANCHOR LINKS

    // =============================================

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener('click', function(e) {

            const targetId = this.getAttribute('href');

            if (targetId === '#' || targetId === '#logout') return;

            

            const targetElement = document.querySelector(targetId);

            if (targetElement) {

                e.preventDefault();

                

                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;

                

                window.scrollTo({

                    top: offsetTop,

                    behavior: 'smooth'

                });

                

                // Close mobile menu if open

                if (hamburgerBtn && navLinks) {

                    hamburgerBtn.classList.remove('active');

                    navLinks.classList.remove('show');

                    document.body.style.overflow = '';

                }

            }

        });

    });

    // =============================================

    // LOADING ANIMATIONS

    // =============================================

    function addLoadingAnimations() {

        const animatedElements = document.querySelectorAll('[data-aos]');

        

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add('aos-animate');

                }

            });

        }, {

            threshold: 0.1,

            rootMargin: '0px 0px -50px 0px'

        });

        

        animatedElements.forEach(el => {

            observer.observe(el);

        });

    }

    

    // Initialize loading animations if AOS is not available

    if (typeof AOS === 'undefined') {

        addLoadingAnimations();

    }

    // =============================================

    // NOTIFICATION SYSTEM

    // =============================================

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

    // =============================================

    // PERFORMANCE OPTIMIZATION

    // =============================================

    function throttle(func, wait) {

        let timeout;

        return function executedFunction(...args) {

            const later = () => {

                clearTimeout(timeout);

                func(...args);

            };

            clearTimeout(timeout);

            timeout = setTimeout(later, wait);

        };

    }

    

    // Apply throttling to scroll events

    const throttledScroll = throttle(() => {

        // Any additional scroll-based animations can go here

    }, 16); // ~60fps

    

    window.addEventListener('scroll', throttledScroll);

    // =============================================

    // EVENT LISTENERS FOR AUTH CHANGES

    // =============================================

    

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

    

    console.log('Merged navigation script initialized successfully');

});

// =============================================

// GLOBAL FUNCTIONS AND EXPORTS

// =============================================

// Export functions for other scripts to use

window.createParticles = function() {

    const event = new CustomEvent('createParticles');

    document.dispatchEvent(event);

};

// Expose updateNavigation globally for other scripts

window.updateNavigation = function() {

    const event = new CustomEvent('updateNavigation');

    document.dispatchEvent(event);

};

// =============================================

// ENHANCED CSS INJECTION - FIXED VERSION

// =============================================

// Add CSS for enhanced mobile menu and effects

const enhancedCSS = `

    /* Enhanced mobile menu styles - FIXED */

    @media (max-width: 992px) {

        .hamburger {

            display: flex !important;

            z-index: 1001;

        }

        

        .nav-links {

            position: fixed !important;

            top: 80px;

            left: 0;

            width: 100% !important;

            height: calc(100vh - 80px);

            background: rgba(0, 0, 0, 0.98) !important;

            backdrop-filter: blur(20px);

            -webkit-backdrop-filter: blur(20px);

            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;

            border-bottom: 2px solid var(--primary);

            overflow-y: auto;

            transform: translateY(-100%) !important;

            opacity: 0 !important;

            visibility: hidden !important;

            flex-direction: column !important;

            align-items: center !important;

            justify-content: flex-start !important;

            padding-top: 50px !important;

            gap: 30px !important;

            z-index: 999 !important;

        }

        

        .nav-links.show {

            transform: translateY(0) !important;

            opacity: 1 !important;

            visibility: visible !important;

            animation: slideDown 0.4s ease-out forwards;

        }

        

        .nav-links li {

            opacity: 0;

            transform: translateX(-50px);

            transition: all 0.3s ease;

            width: auto;

        }

        

        .nav-links.show li {

            opacity: 1;

            transform: translateX(0);

        }

        

        .nav-links.show li:nth-child(1) { transition-delay: 0.1s; }

        .nav-links.show li:nth-child(2) { transition-delay: 0.2s; }

        .nav-links.show li:nth-child(3) { transition-delay: 0.3s; }

        .nav-links.show li:nth-child(4) { transition-delay: 0.4s; }

        .nav-links.show li:nth-child(5) { transition-delay: 0.5s; }

        .nav-links.show li:nth-child(6) { transition-delay: 0.6s; }

        .nav-links.show li:nth-child(7) { transition-delay: 0.7s; }

        .nav-links.show li:nth-child(8) { transition-delay: 0.8s; }

        .nav-links.show li:nth-child(9) { transition-delay: 0.9s; }

        

        .nav-links li a {

            font-size: 1.2rem;

            padding: 15px 25px;

            display: block;

            text-align: center;

        }

        

        .hamburger-line {

            transform-origin: center;

        }

        

        /* FIXED: Mobile auth items styling */

        .mobile-auth-item {

            /* Don't force hide - let JavaScript control visibility */

        }

        

        .mobile-auth-item a {

            color: var(--text-dark) !important;

            font-size: 1.2rem !important;

            padding: 15px 25px !important;

            display: flex !important;

            align-items: center !important;

            justify-content: center !important;

            gap: 8px !important;

            text-align: center !important;

        }

        

        .mobile-auth-item a:hover {

            color: var(--primary) !important;

        }

        

        /* Fix nav-center-container positioning */

        .nav-center-container {

            position: static;

            justify-content: center;

            pointer-events: auto;

        }

    }

    

    /* Always hide mobile auth items on desktop */

    @media (min-width: 993px) {

        .mobile-auth-item {

            display: none !important;

        }

        

        .hamburger {

            display: none !important;

        }

    }

    

    @keyframes slideDown {

        from {

            opacity: 0;

            transform: translateY(-20px);

        }

        to {

            opacity: 1;

            transform: translateY(0);

        }

    }

    

    /* Enhanced particle animation */

    @keyframes float {

        0% {

            transform: translateY(100vh) rotate(0deg) translateZ(0);

            opacity: 0;

        }

        10% {

            opacity: 1;

        }

        90% {

            opacity: 1;

        }

        100% {

            transform: translateY(-100vh) rotate(var(--random-rotation, 360deg)) translateZ(50px);

            opacity: 0;

        }

    }

    

    .particle {

        border-radius: 50%;

        pointer-events: none;

        position: absolute;

        will-change: transform, opacity;

    }

    

    /* Ensure hamburger is always visible on mobile */

    .hamburger {

        display: none;

        background: none;

        border: none;

        cursor: pointer;

        padding: 10px;

        z-index: 1001;

        flex-direction: column;

        justify-content: space-between;

        width: 30px;

        height: 21px;

        position: relative;

    }

    

    /* Enhanced notification styles */

    .notification {

        font-family: 'Orbitron', sans-serif;

        font-size: 14px;

    }

    

    .notification-icon {

        font-size: 18px;

        flex-shrink: 0;

    }

    

    .notification-content {

        flex: 1;

    }

    

    /* Desktop auth buttons responsive adjustments */

    @media (max-width: 480px) {

        #auth-buttons {

            top: 10px !important;

            right: 10px !important;

            gap: 5px !important;

        }

        

        #auth-buttons .dashboard-btn,

        #auth-buttons .logout-btn {

            padding: 6px 12px !important;

            font-size: 11px !important;

        }

    }

    

    /* Smooth transitions for all nav elements */

    .nav-links li,

    .mobile-auth-item {

        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    }

    

    /* Enhanced mobile auth item styling */

    .mobile-auth-item a i {

        font-size: 16px;

        width: 20px;

        text-align: center;

    }

    

    /* Fix for mobile menu z-index issues */

    .navbar {

        position: relative;

        z-index: 1000;

    }

    

    .nav-links {

        z-index: 999;

    }

    

    /* Ensure proper scrolling on mobile menu */

    .nav-links::-webkit-scrollbar {

        width: 4px;

    }

    

    .nav-links::-webkit-scrollbar-track {

        background: transparent;

    }

    

    .nav-links::-webkit-scrollbar-thumb {

        background: var(--primary);

        border-radius: 2px;

    }

    

    /* Loading state for navigation */

    .nav-loading {

        opacity: 0.7;

        pointer-events: none;

    }

    

    /* Active state for mobile auth items */

    .mobile-auth-item.active a {

        background: linear-gradient(45deg, var(--primary), var(--secondary));

        color: white !important;

        border-radius: 8px;

    }

`;

// Inject enhanced CSS

const styleSheet = document.createElement('style');

styleSheet.textContent = enhancedCSS;

document.head.appendChild(styleSheet);

console.log('Enhanced CSS injected successfully');

console.log('Merged navigation script loaded successfully');
