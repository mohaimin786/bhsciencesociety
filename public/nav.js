// Check login status and update nav
function updateNavigation() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const login = document.querySelectorAll('.nav-links li a[href="login.html"]');
  const register = document.querySelectorAll('.nav-links li a[href="register.html"]');
  
  navLinks.forEach(link => {
    const listItem = link.parentElement;
    if (isLoggedIn) {
      listItem.style.display = 'none';
    } else {
      listItem.style.display = 'block';
    }
  });
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', updateNavigation);
