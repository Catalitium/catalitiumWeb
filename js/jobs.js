// Jobs page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Simple mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Add this function to anonymize company names
    function anonymizeCompanyName(companyName) {
        if (!companyName || companyName.trim() === '') {
            return 'Company***';
        }
        
        // Handle different company name formats
        const name = companyName.trim();
        
        // If it's already anonymized, return as is
        if (name.includes('***')) {
            return name;
        }
        
        // For company names with spaces, take first word + ***
        if (name.includes(' ')) {
            const firstWord = name.split(' ')[0];
            return `${firstWord}***`;
        }
        
        // For single word companies, take first 3-4 letters + ***
        if (name.length <= 4) {
            return `${name}***`;
        } else {
            return `${name.substring(0, 4)}***`;
        }
    }

    // Fallback formatSalary function if not available globally
    function formatSalary(salary, currency = 'USD') {
        if (!salary || isNaN(salary) || salary <= 0) {
            return 'N/A';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
            minimumFractionDigits: 0
        }).format(salary);
    }

    // Function to format salary from the new salary column
    function formatJobSalary(salaryString) {
        if (!salaryString || salaryString.trim() === '') {
            return 'N/A';
        }
        
        // If it's already formatted (like "$40" or "$50,000 - $70,000"), return as is
        if (salaryString.includes('$')) {
            return salaryString;
        }
        
        // Try to parse as number and format
        const salary = parseFloat(salaryString);
        if (!isNaN(salary) && salary > 0) {
            return (window.formatSalary || formatSalary)(salary, 'USD');
        }
        
        // If it's a range or other format, return as is
        return salaryString;
    }

    // Update only the createJobCard function to use anonymized company names
    function createJobCard(job) {
        const isRemote = job.JobTitle.toLowerCase().includes('remote') || 
                        job.Location.toLowerCase().includes('remote');
        
        // Handle salary - check if there's a direct salary column first
        let formattedSalary = 'N/A';
        if (job.Salary) {
            formattedSalary = formatJobSalary(job.Salary);
        } else if (job.MedianSalary) {
            const salary = parseFloat(job.MedianSalary);
            const currency = job.CurrencyTicker || 'USD';
            formattedSalary = (window.formatSalary || formatSalary)(salary, currency);
        }
        
        // Anonymize company name for display
        const displayCompanyName = anonymizeCompanyName(job.CompanyName);
        
        // Create URL parameters for the job application form (simplified)
        const urlParams = new URLSearchParams({
            title: encodeURIComponent(job.JobTitle),
            company: encodeURIComponent(job.CompanyName),
            location: encodeURIComponent(job.Location),
            salary: encodeURIComponent(formattedSalary)
        });
        
        const jobApplyUrl = `job-apply.html?${urlParams.toString()}`;
        
        return `
            <div class="job-card">
                <div class="job-header">
                    <h3>
                        <a href="${jobApplyUrl}">${job.JobTitle}</a>
                    </h3>
                    <div class="badge-container">
                        ${isRemote ? `
                            <span class="remote-badge">
                                <i class="fas fa-globe"></i>Remote
                            </span>
                        ` : ''}
                        <span class="job-type-badge">
                            <i class="fas fa-briefcase"></i>${job.JobType || 'Full-time'}
                        </span>
                    </div>
                </div>
                
                <div class="company">
                    <strong>${displayCompanyName}</strong>
                    <p class="location">
                        <i class="fas fa-map-marker-alt"></i>${job.Location}
                    </p>
                </div>
                
                <div class="job-details">
                    <div class="detail-item">
                        <span>Experience</span>
                        <p>${job.Experience || 'Not specified'}</p>
                    </div>
                    <div class="detail-item">
                        <span>Salary</span>
                        <p>${formattedSalary}</p>
                    </div>
                </div>
                
                <div class="job-actions">
                    <a href="${jobApplyUrl}" class="view-job-btn">
                        <span data-en="Apply Now" data-es="Aplicar Ahora">Apply Now</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }

    // Make createJobCard function globally available for script.js
    window.createJobCard = createJobCard;
    window.anonymizeCompanyName = anonymizeCompanyName;
    window.formatSalary = formatSalary;
    window.formatJobSalary = formatJobSalary;

    // Add click tracking for job cards
    function addJobCardTracking() {
        document.addEventListener('click', function(e) {
            if (e.target.closest('.job-card')) {
                const jobCard = e.target.closest('.job-card');
                const jobTitle = jobCard.querySelector('h3 a')?.textContent || '';
                const companyName = jobCard.querySelector('.company strong')?.textContent || '';
                const location = jobCard.querySelector('.location')?.textContent || '';
                
                // Track job view with Google Analytics
                if (typeof trackJobView === 'function') {
                    trackJobView(jobTitle, companyName, location);
                }
            }
        });
    }

    // Initialize tracking when DOM is ready
    addJobCardTracking();
}); 