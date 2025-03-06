// main.js

// Mobile Navigation Handler
const initializeMobileMenu = () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
  
    const toggleMenu = () => {
      mobileMenuBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
      body.classList.toggle('no-scroll');
    };
  
    const closeMenu = () => {
      mobileMenuBtn.classList.remove('active');
      navMenu.classList.remove('active');
      body.classList.remove('no-scroll');
    };
  
    mobileMenuBtn.addEventListener('click', toggleMenu);
  
    // Close menu on click outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        closeMenu();
      }
    });
  
    // Close menu on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    });
  
    // Close menu on navigation click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  };
  
  // Smooth Scroll Implementation
  const initializeSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  };
  
  // Form Validation and Submission
  const initializeContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;
  
    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    };
  
    const showError = (input, message) => {
      const formGroup = input.closest('.form-group');
      const error = formGroup.querySelector('.form-error');
      input.classList.add('is-invalid');
      error.textContent = message;
      error.classList.add('active');
    };
  
    const clearError = (input) => {
      const formGroup = input.closest('.form-group');
      const error = formGroup.querySelector('.form-error');
      input.classList.remove('is-invalid');
      error.classList.remove('active');
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      let isValid = true;
  
      // Validate fields
      form.querySelectorAll('input, textarea').forEach(input => {
        if (input.required && !input.value.trim()) {
          showError(input, 'This field is required');
          isValid = false;
        }
        
        if (input.type === 'email' && !validateEmail(input.value)) {
          showError(input, 'Please enter a valid email');
          isValid = false;
        }
      });
  
      if (!isValid) return;
  
      // Submit form
      try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
  
        // Replace with your form handling endpoint
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
  
        if (response.ok) {
          form.reset();
          showToast('Message sent successfully!', 'success');
        } else {
          throw new Error('Server error');
        }
      } catch (error) {
        showToast('Error sending message. Please try again.', 'error');
      } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message';
      }
    };
  
    // Real-time validation
    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        if (input.value.trim()) clearError(input);
      });
    });
  
    form.addEventListener('submit', handleSubmit);
  };
  
  // Toast Notification System
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-fadeIn`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };
  
  // Intersection Observer for Animations
  const initializeAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });
  
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  };
  
  // Initialize all functionality
  document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    initializeSmoothScroll();
    initializeContactForm();
    initializeAnimations();
  });
  
  // Utility Functions
  const debounce = (func, wait = 100) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };
  
  // Smooth scroll to top button
  window.addEventListener('scroll', debounce(() => {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  }));
  
  document.getElementById('scrollTopBtn')?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });