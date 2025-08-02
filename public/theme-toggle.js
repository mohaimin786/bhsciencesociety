
      // Hamburger menu functionality
      const hamburgerBtn = document.getElementById('hamburger-btn');
      const navLinks = document.getElementById('navLinks');

      hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburgerBtn.classList.toggle('active');
        navLinks.classList.toggle('show');
      });
      
      // Close menu when clicking on a link
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
 function createParticles() {
    const particlesContainer = document.getElementById('particles-js');
    const particleCount = Math.floor(window.innerWidth / 10);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random size between 1px and 3px
      const size = Math.random() * 2 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random animation
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      particle.style.animation = `float ${duration}s linear ${delay}s infinite`;
      
      particlesContainer.appendChild(particle);
    }
  }

  createParticles();