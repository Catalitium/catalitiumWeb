// Dark mode functionality
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileDarkModeToggle = document.getElementById('mobileDarkModeToggle');
const html = document.documentElement;

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
}

// Toggle dark mode
function toggleDarkMode() {
    html.classList.toggle('dark');
    localStorage.setItem('darkMode', html.classList.contains('dark'));
}

darkModeToggle.addEventListener('click', toggleDarkMode);
mobileDarkModeToggle.addEventListener('click', toggleDarkMode);

// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');
let isMobileMenuOpen = false;

mobileMenuButton.addEventListener('click', () => {
    isMobileMenuOpen = !isMobileMenuOpen;
    mobileMenu.classList.toggle('hidden');
    mobileMenuButton.innerHTML = isMobileMenuOpen ? 
        '<i class="fas fa-times text-gray-600 dark:text-gray-300"></i>' : 
        '<i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>';
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (isMobileMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        isMobileMenuOpen = false;
        mobileMenu.classList.add('hidden');
        mobileMenuButton.innerHTML = '<i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>';
    }
});

// Close mobile menu when clicking a link
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        isMobileMenuOpen = false;
        mobileMenu.classList.add('hidden');
        mobileMenuButton.innerHTML = '<i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>';
    });
});

// Loading animation
window.addEventListener('load', () => {
    const loader = document.querySelector('.loading');
    loader.classList.add('hidden');
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-4');
        }
    });
}, observerOptions);

// Add fade-in animation to sections
document.querySelectorAll('section').forEach(section => {
    section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-4');
    observer.observe(section);
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('shadow-md');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('shadow-md')) {
        // Scrolling down
        navbar.classList.add('shadow-md');
    } else if (currentScroll < lastScroll && navbar.classList.contains('shadow-md')) {
        // Scrolling up
        navbar.classList.remove('shadow-md');
    }
    
    lastScroll = currentScroll;
});

// Add hover effect to feature cards
document.querySelectorAll('.group').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Add scroll progress indicator
const progressBar = document.createElement('div');
progressBar.className = 'fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-300';
progressBar.style.width = '0%';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
});

// Add typing effect to hero text
const heroText = document.querySelector('.hero-text');
if (heroText) {
    const text = heroText.textContent;
    heroText.textContent = '';
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            heroText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }

    typeWriter();
}

// Google Analytics Event Tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track page scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            // Track at 25%, 50%, 75%, and 100% scroll
            if (maxScroll >= 25 && maxScroll < 50) {
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'event_label': '25%'
                });
            } else if (maxScroll >= 50 && maxScroll < 75) {
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'event_label': '50%'
                });
            } else if (maxScroll >= 75 && maxScroll < 100) {
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'event_label': '75%'
                });
            } else if (maxScroll >= 100) {
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'event_label': '100%'
                });
            }
        }
    });

    // Track time on page
    let startTime = new Date().getTime();
    window.addEventListener('beforeunload', function() {
        let endTime = new Date().getTime();
        let timeSpent = Math.round((endTime - startTime) / 1000); // Convert to seconds
        gtag('event', 'time_spent', {
            'event_category': 'engagement',
            'event_label': timeSpent + ' seconds'
        });
    });

    // Track navigation clicks
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            gtag('event', 'navigation_click', {
                'event_category': 'navigation',
                'event_label': this.getAttribute('href') || 'unknown'
            });
        });
    });

    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            gtag('event', 'form_submission', {
                'event_category': 'conversion',
                'event_label': this.getAttribute('id') || 'unknown_form'
            });
        });
    });

    // Track video interactions
    const video = document.querySelector('iframe[src*="youtube.com"]');
    if (video) {
        gtag('event', 'video_present', {
            'event_category': 'engagement',
            'event_label': 'video_loaded'
        });
    }
}); 