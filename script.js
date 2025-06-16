// Dark mode functionality
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileDarkModeToggle = document.getElementById('mobileDarkModeToggle');
const html = document.documentElement;

// Language toggle functionality
const languageToggle = document.getElementById('languageToggle');
const mobileLanguageToggle = document.getElementById('mobileLanguageToggle');
let currentLang = localStorage.getItem('language') || 'en';

// Function to update language
function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Update all elements with data-en and data-es attributes
    document.querySelectorAll('[data-en][data-es]').forEach(element => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });
    
    // Update flag images
    document.querySelectorAll('img[data-lang]').forEach(img => {
        if (img.getAttribute('data-lang') === lang) {
            img.classList.remove('hidden');
        } else {
            img.classList.add('hidden');
        }
    });
}

// Initialize language
updateLanguage(currentLang);

// Toggle language
function toggleLanguage() {
    const newLang = currentLang === 'en' ? 'es' : 'en';
    updateLanguage(newLang);
}

// Add event listeners for language toggle
if (languageToggle) {
    languageToggle.addEventListener('click', toggleLanguage);
}
if (mobileLanguageToggle) {
    mobileLanguageToggle.addEventListener('click', toggleLanguage);
}

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

// Enhanced Google Analytics Tracking
document.addEventListener('DOMContentLoaded', function() {
    // 1. Conversion Goals Tracking
    // Track PDF downloads
    document.querySelectorAll('a[href$=".pdf"]').forEach(pdfLink => {
        pdfLink.addEventListener('click', function() {
            gtag('event', 'pdf_download', {
                'event_category': 'conversion',
                'event_label': this.getAttribute('href').split('/').pop()
            });
        });
    });

    // Track video interactions
    const video = document.querySelector('iframe[src*="youtube.com"]');
    if (video) {
        // Track when video is in viewport
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gtag('event', 'video_view', {
                        'event_category': 'conversion',
                        'event_label': 'video_in_view'
                    });
                }
            });
        });
        videoObserver.observe(video);
    }

    // 2. Content Engagement Tracking
    // Track section visibility
    document.querySelectorAll('section').forEach(section => {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gtag('event', 'section_view', {
                        'event_category': 'content_engagement',
                        'event_label': section.id || 'unnamed_section'
                    });
                }
            });
        });
        sectionObserver.observe(section);
    });

    // Track FAQ interactions
    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.addEventListener('click', function() {
            gtag('event', 'faq_interaction', {
                'event_category': 'content_engagement',
                'event_label': this.querySelector('h3')?.textContent || 'unknown_faq'
            });
        });
    });

    // 3. User Journey Tracking
    // Track entry point
    gtag('event', 'page_entry', {
        'event_category': 'user_journey',
        'event_label': window.location.pathname
    });

    // Track navigation flow
    let previousPage = document.referrer;
    if (previousPage) {
        gtag('event', 'navigation_flow', {
            'event_category': 'user_journey',
            'event_label': previousPage
        });
    }

    // Track exit intent
    document.addEventListener('mouseout', function(e) {
        if (e.clientY <= 0) {
            gtag('event', 'exit_intent', {
                'event_category': 'user_journey',
                'event_label': 'top_of_page'
            });
        }
    });

    // 4. Device & Location Analytics
    // Track device information
    gtag('event', 'device_info', {
        'event_category': 'technical',
        'event_label': {
            'screen_size': `${window.innerWidth}x${window.innerHeight}`,
            'user_agent': navigator.userAgent
        }
    });
}); 