// Job Application Form JavaScript
(function() {
    'use strict';

    // Cache DOM elements for performance
    const elements = {
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        navLinks: document.getElementById('navLinks'),
        fileUpload: document.getElementById('fileUpload'),
        resume: document.getElementById('resume'),
        fileText: document.getElementById('fileText'),
        submitBtn: document.getElementById('submitBtn'),
        form: document.querySelector('form'),
        toggleContainer: document.getElementById('toggleContainer'),
        toggleSwitch: document.getElementById('toggleSwitch'),
        workPermit: document.getElementById('workPermit'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        coverLetter: document.getElementById('coverLetter'),
        // Hidden fields for job information
        jobTitle: document.getElementById('jobTitle'),
        company: document.getElementById('company'),
        location: document.getElementById('location'),
        salary: document.getElementById('salary')
    };

    // File validation constants
    const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    // Initialize the application
    function init() {
        setupEventListeners();
        autoPopulateFromURL();
        trackPageView();
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Mobile menu toggle
        elements.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);

        // Toggle switch functionality
        elements.toggleContainer?.addEventListener('click', handleToggleClick);
        elements.toggleContainer?.addEventListener('keydown', handleToggleKeydown);

        // File upload handling
        elements.resume?.addEventListener('change', handleFileUpload);
        elements.fileUpload?.addEventListener('click', () => elements.resume?.click());
        elements.fileUpload?.addEventListener('keydown', handleFileUploadKeydown);

        // Email validation
        elements.email?.addEventListener('blur', validateEmail);
        elements.email?.addEventListener('input', clearEmailError);

        // Form submission
        elements.form?.addEventListener('submit', handleFormSubmit);
    }

    // Mobile menu functionality
    function toggleMobileMenu() {
        elements.navLinks?.classList.toggle('active');
    }

    // Toggle switch functionality
    function handleToggleClick() {
        const isChecked = !elements.workPermit.checked;
        elements.workPermit.checked = isChecked;
        elements.toggleSwitch.classList.toggle('active', isChecked);
        
        // Track toggle interaction
        trackEvent('toggle_work_permit', { value: isChecked });
    }

    // Keyboard accessibility for toggle
    function handleToggleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            elements.toggleContainer.click();
        }
    }

    // File upload handling
    function handleFileUpload(e) {
        const file = e.target.files[0];
        
        if (file) {
            if (!validateFile(file)) {
                e.target.value = '';
                return;
            }
            
            updateFileUploadUI(file);
        }
    }

    // File validation
    function validateFile(file) {
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            alert("Only PDF, DOC, or DOCX files allowed.");
            return false;
        }
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            alert("File size must be less than 5MB.");
            return false;
        }
        
        return true;
    }

    // Update file upload UI
    function updateFileUploadUI(file) {
        elements.fileText.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
        elements.fileUpload.classList.add('success');
    }

    // File upload keyboard accessibility
    function handleFileUploadKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            elements.resume?.click();
        }
    }

    // Email validation
    function validateEmail() {
        const email = elements.email.value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (email && !emailRegex.test(email)) {
            showEmailError('Please enter a valid email address');
            return false;
        }
        
        clearEmailError();
        return true;
    }

    function showEmailError(message) {
        clearEmailError();
        elements.email.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        elements.email.parentNode.appendChild(errorDiv);
    }

    function clearEmailError() {
        elements.email.classList.remove('error');
        const existingError = elements.email.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    // Form submission handling
    function handleFormSubmit(e) {
        // Validate email before submission
        if (!validateEmail()) {
            e.preventDefault();
            elements.email.focus();
            return;
        }
        
        // Add loading state
        elements.submitBtn.disabled = true;
        elements.submitBtn.textContent = 'Submitting...';
        elements.form.classList.add('loading');
        
        // Track form submission
        trackEvent('form_submit', { form_name: 'job-application' });
    }

    // Auto-populate form fields from URL parameters
    function autoPopulateFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Pre-fill hidden fields with job information
        const hiddenFields = {
            jobTitle: urlParams.get('title') || urlParams.get('jobTitle'),
            company: urlParams.get('company'),
            location: urlParams.get('location'),
            salary: urlParams.get('salary')
        };
        
        // Set values for hidden fields
        Object.keys(hiddenFields).forEach(fieldName => {
            const value = hiddenFields[fieldName];
            if (value && elements[fieldName]) {
                elements[fieldName].value = decodeURIComponent(value);
            }
        });
        
        // Update page title and description if job title is available
        if (hiddenFields.jobTitle) {
            const jobTitle = decodeURIComponent(hiddenFields.jobTitle);
            const company = hiddenFields.company ? decodeURIComponent(hiddenFields.company) : '';
            
            // Update page title
            document.title = `Apply for ${jobTitle} | Catalitium`;
            
            // Update meta description
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.content = `Apply for ${jobTitle} position${company ? ` at ${company}` : ''}. Submit your application with Catalitium.`;
            }
            
            // Update header text
            const headerTitle = document.querySelector('.header h1');
            const headerSubtitle = document.querySelector('.header p');
            
            if (headerTitle) {
                headerTitle.textContent = `Apply for ${jobTitle}`;
            }
            
            if (headerSubtitle) {
                headerSubtitle.textContent = `Submit your application for ${jobTitle}${company ? ` at ${company}` : ''}`;
            }
        }
        
        // Track job application view with job details
        if (hiddenFields.jobTitle) {
            trackEvent('job_application_view', {
                job_title: hiddenFields.jobTitle,
                company: hiddenFields.company,
                location: hiddenFields.location
            });
        }
    }

    // Analytics tracking functions
    function trackEvent(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    }

    function trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Job Application',
                page_location: window.location.href
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(); 