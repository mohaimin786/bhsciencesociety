// Enhanced navigation handler
function updateNavigation() {
  console.log('Updating navigation based on login state');
  
  // Check auth state
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('token');
  console.log(`Auth state - isLoggedIn: ${isLoggedIn}, token exists: ${!!token}`);
  
  // More flexible selectors that work with common navigation patterns
  const loginElements = document.querySelectorAll(
    'a[href*="login"], .login-link, [data-nav="login"]'
  );
  const registerElements = document.querySelectorAll(
    'a[href*="register"], .register-link, [data-nav="register"]'
  );
  const logoutElements = document.querySelectorAll(
    'a[href*="logout"], .logout-link, [data-nav="logout"]'
  );
  const protectedElements = document.querySelectorAll(
    'a[href*="dashboard"], a[href*="profile"], [data-nav="protected"]'
  );

  console.log(`Found elements - login: ${loginElements.length}, register: ${registerElements.length}, logout: ${logoutElements.length}`);

  const showWhenLoggedIn = isLoggedIn && token;
  const showWhenLoggedOut = !isLoggedIn || !token;

  // Update visibility
  loginElements.forEach(el => {
    el.closest('li, .nav-item')?.style.display = showWhenLoggedOut ? 'block' : 'none';
  });
  
  registerElements.forEach(el => {
    el.closest('li, .nav-item')?.style.display = showWhenLoggedOut ? 'block' : 'none';
  });
  
  logoutElements.forEach(el => {
    el.closest('li, .nav-item')?.style.display = showWhenLoggedIn ? 'block' : 'none';
  });
  
  protectedElements.forEach(el => {
    el.closest('li, .nav-item')?.style.display = showWhenLoggedIn ? 'block' : 'none';
  });
}

// Handle logout
function handleLogout(e) {
  if (e) e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('isLoggedIn');
  console.log('User logged out');
  updateNavigation();
  window.location.href = '/index.html'; // Adjust as needed
}

// Initialize - with multiple ways to trigger
function initNavigation() {
  // Run immediately
  updateNavigation();
  
  // Also run when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', updateNavigation);
  
  // Handle dynamic content (for SPAs or AJAX-loaded nav)
  const observer = new MutationObserver(updateNavigation);
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  // Attach logout handlers
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[href="#logout"], .logout-link')) {
      handleLogout(e);
    }
  });
  
  console.log('Navigation handler initialized');
}

// Start everything
initNavigation();
