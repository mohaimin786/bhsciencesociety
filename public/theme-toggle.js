// theme-toggle.js - Enhanced with hamburger menu and particle effects

document.addEventListener('DOMContentLoaded', function() {
    console.log('Theme toggle script loaded');
    
    // Hamburger menu functionality - Enhanced and Fixed
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburgerBtn && navLinks) {
        console.log('Hamburger menu elements found, setting up event listeners');
        
        // Main hamburger click handler
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
    
    // Enhanced particle system
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
    
    // Navbar scroll effect with enhanced animations
    let lastScrollY = 0;
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
            
            // Hide navbar when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Enhanced floating icons animation
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
    
    // Smooth scrolling for anchor links
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
    
    // Add loading animations
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
    
    // Performance optimization - Throttle scroll events
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
    
    console.log('Theme toggle script initialized successfully');
});

// Export functions for other scripts to use
window.createParticles = function() {
    const event = new CustomEvent('createParticles');
    document.dispatchEvent(event);
};

// Add CSS for enhanced mobile menu - FIXED VERSION
const additionalCSS = `
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
        
        /* Hide mobile auth items by default on all screen sizes */
        .mobile-auth-item {
            display: none !important;
        }
        
        /* Only show mobile auth items in mobile view when logged in */
        .nav-links .mobile-auth-item.show-mobile-auth {
            display: block !important;
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
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);
