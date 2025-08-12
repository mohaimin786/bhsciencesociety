// nav.js - Complete Navigation Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Navigation script loaded');
    
    // Initialize hamburger menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', function() {
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
        
        // Create logout link if it doesn't exist
        if ((isLoggedIn || token) && !logoutLink) {
            console.log('Creating logout link');
            const navLinks = document.getElementById('navLinks');
            if (navLinks) {
                const li = document.createElement('li');
                li.innerHTML = '<a href="#logout">Logout</a>';
                navLinks.appendChild(li);
                logoutLink = li.querySelector('a');
                
                // Add click handler
                logoutLink.addEventListener('click', function(e) {
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
        
        // Update visibility
        if (isLoggedIn && token) {
            console.log('User is logged in - hiding register/login');
            if (registerLink) registerLink.closest('li').style.display = 'none';
            if (loginLink) loginLink.closest('li').style.display = 'none';
            if (logoutLink) logoutLink.closest('li').style.display = 'block';
        } else {
            console.log('User is logged out - showing register/login');
            if (registerLink) registerLink.closest('li').style.display = 'block';
            if (loginLink) loginLink.closest('li').style.display = 'block';
            if (logoutLink) logoutLink.closest('li').style.display = 'none';
        }
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
    window.addEventListener('storage', function(e) {
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
