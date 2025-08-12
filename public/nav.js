// Check login status and update nav
function updateNavigation() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('token');
  const loginLinks = document.querySelectorAll('.nav-links li a[href="login.html"]');
  const registerLinks = document.querySelectorAll('.nav-links li a[href="register.html"]');
  const logoutLinks = document.querySelectorAll('.nav-links li a[href="#logout"]');
  const protectedLinks = document.querySelectorAll('.nav-links li a[href^="dashboard"], .nav-links li a[href^="profile"]');

  if (isLoggedIn && token) {
    // User is logged in - hide login/register, show logout and protected links
    loginLinks.forEach(link => link.parentElement.style.display = 'none');
    registerLinks.forEach(link => link.parentElement.style.display = 'none');
    logoutLinks.forEach(link => link.parentElement.style.display = 'block');
    protectedLinks.forEach(link => link.parentElement.style.display = 'block');
  } else {
    // User is not logged in - show login/register, hide logout and protected links
    loginLinks.forEach(link => link.parentElement.style.display = 'block');
    registerLinks.forEach(link => link.parentElement.style.display = 'block');
    logoutLinks.forEach(link => link.parentElement.style.display = 'none');
    protectedLinks.forEach(link => link.parentElement.style.display = 'none');
  }
}

// Logout function
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isLoggedIn');
  updateNavigation();
  window.location.href = '/index.html';
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', () => {
  updateNavigation();
  
  // Add logout event listeners
  document.querySelectorAll('a[href="#logout"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
});
