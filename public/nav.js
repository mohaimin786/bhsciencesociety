// navigation.js
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('token');
  
  console.log(`Auth status - Logged in: ${isLoggedIn}, Token exists: ${!!token}`);
  
  // Get the nav links container
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) {
    console.error('Could not find navLinks element');
    return;
  }

  // Find specific links
  const registerLink = navLinks.querySelector('a[href="register.html"]');
  const loginLink = navLinks.querySelector('a[href="login.html"]');
  
  // Create logout link if it doesn't exist
  let logoutLink = navLinks.querySelector('a[href="#logout"]');
  if (!logoutLink && (isLoggedIn || token)) {
    logoutLink = document.createElement('a');
    logoutLink.href = '#logout';
    logoutLink.textContent = 'Logout';
    const listItem = document.createElement('li');
    listItem.appendChild(logoutLink);
    navLinks.appendChild(listItem);
  }

  // Update link visibility
  if (isLoggedIn && token) {
    // User is logged in - hide register/login
    if (registerLink) registerLink.closest('li').style.display = 'none';
    if (loginLink) loginLink.closest('li').style.display = 'none';
    if (logoutLink) logoutLink.closest('li').style.display = 'block';
  } else {
    // User is not logged in - show register/login
    if (registerLink) registerLink.closest('li').style.display = 'block';
    if (loginLink) loginLink.closest('li').style.display = 'block';
    if (logoutLink) logoutLink.closest('li').style.display = 'none';
  }

  // Add logout functionality
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'index.html';
    });
  }

  // Hamburger menu functionality (if needed)
  const hamburgerBtn = document.getElementById('hamburger-btn');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function() {
      navLinks.classList.toggle('show');
    });
  }
});

// Also run when login state might change (like after login)
window.addEventListener('storage', function(e) {
  if (e.key === 'isLoggedIn' || e.key === 'token') {
    location.reload(); // Simplest way to reflect changes
  }
});
