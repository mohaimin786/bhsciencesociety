// Check login status and update nav
function updateNavigation() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const navLinks = document.querySelectorAll('.nav-links li a[href="login.html"]');
  
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
