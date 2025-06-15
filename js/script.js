// Global variables
let jobsData = [];
let salaryData = [];
let currentPage = 1;
const jobsPerPage = 10;
let searchStartTime = null;

// Performance monitoring
const performanceMetrics = {
    dataLoadTime: 0,
    searchTime: 0,
    renderTime: 0
};

// Load and parse CSV files
async function loadData() {
    const startTime = performance.now();
    try {
        // Load jobs data
        const jobsResponse = await fetch('/data/jobs.csv');
        const jobsText = await jobsResponse.text();
        jobsData = parseCSV(jobsText);
        console.log('Jobs data loaded:', jobsData.length, 'records');

        // Load salary data
        const salaryResponse = await fetch('/data/salary.csv');
        const salaryText = await salaryResponse.text();
        salaryData = parseCSV(salaryText);
        console.log('Salary data loaded:', salaryData.length, 'records');

        // Track data load performance
        performanceMetrics.dataLoadTime = performance.now() - startTime;
        if (typeof gtag !== 'undefined') {
            gtag('event', 'data_load', {
                'load_time': performanceMetrics.dataLoadTime,
                'jobs_count': jobsData.length,
                'salary_count': salaryData.length,
                'event_category': 'Performance',
                'event_label': 'Data Load'
            });
        }

        // Debug: Check unique countries
        const countries = [...new Set(salaryData.map(item => item.Country))];
        console.log('Available countries:', countries);

        // Populate country dropdown
        populateCountryOptions();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please try again later.');
        
        // Track error
        if (typeof gtag !== 'undefined') {
            gtag('event', 'error', {
                'error_type': 'data_load',
                'error_message': error.message,
                'event_category': 'Error',
                'event_label': 'Data Load Error'
            });
        }
    }
}

// Parse CSV text into array of objects
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    console.log('CSV first line:', lines[0]); // Debug: Check headers
    
    // Split by tab instead of comma
    const headers = lines[0].split('\t').map(header => header.trim());
    console.log('Parsed headers:', headers); // Debug: Check parsed headers
    
    const parsed = lines.slice(1).map(line => {
        // Split by tab instead of comma
        const values = line.split('\t').map(value => value.trim());
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        return obj;
    });
    
    console.log('First parsed record:', parsed[0]); // Debug: Check first record
    return parsed;
}

// Populate country dropdown
function populateCountryOptions() {
    const countrySelect = document.getElementById('countrySelect');
    console.log('Country select element:', countrySelect); // Debug: Check if element exists
    
    // Use the correct column name from the CSV
    const countries = [...new Set(salaryData.map(item => item.Country))].sort();
    console.log('Countries for dropdown:', countries); // Debug: Check countries array
    
    if (!countrySelect) {
        console.error('Country select element not found!');
        return;
    }
    
    countrySelect.innerHTML = `
        <option value="">Select a country</option>
        ${countries.map(country => `
            <option value="${country}">${country}</option>
        `).join('')}
    `;
    
    console.log('Dropdown HTML:', countrySelect.innerHTML); // Debug: Check final HTML
}

// Update UI based on user input
function updateUI() {
    searchStartTime = performance.now();
    const country = document.getElementById('countrySelect').value;
    const jobTitle = document.getElementById('jobInput').value.toLowerCase();
    
    // Track search start
    if (typeof gtag !== 'undefined') {
        gtag('event', 'search_start', {
            'country': country,
            'job_title': jobTitle,
            'event_category': 'Search',
            'event_label': 'Search Start'
        });
    }
    
    // Update salary information
    updateSalaryInfo(country, jobTitle);
    
    // Update job listings
    updateJobListings(country, jobTitle);
}

// Update salary information
function updateSalaryInfo(country, jobTitle) {
    const startTime = performance.now();
    const salaryOutput = document.getElementById('salaryOutput');
    const countryData = salaryData.filter(item => 
        item.Country === country && 
        item.Location.toLowerCase().includes(jobTitle)
    );

    // Track country selection with enhanced data
    if (typeof gtag !== 'undefined') {
        gtag('event', 'country_select', {
            'country': country,
            'job_title': jobTitle,
            'results_count': countryData.length,
            'has_salary_data': countryData.length > 0,
            'event_category': 'Search',
            'event_label': 'Country Selection'
        });
    }

    if (countryData.length === 0) {
        salaryOutput.innerHTML = `
            <div class="salary-stats">
                <div class="salary-range">
                    <h3>No salary data available</h3>
                    <p>Try selecting a different country or job title</p>
                </div>
            </div>
        `;
        return;
    }

    const avgSalary = calculateAverageSalary(countryData);
    const maxSalary = Math.max(...countryData.map(item => parseFloat(item.MedianSalary)));
    const currency = countryData[0].CurrencyTicker;

    salaryOutput.innerHTML = `
        <div class="salary-stats">
            <div class="salary-range">
                <h3>Salary Insights for ${country}</h3>
                <div class="salary-metrics">
                    <div class="metric">
                        <span class="label">Average Salary</span>
                        <span class="value">${formatSalary(avgSalary, currency)}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Maximum Salary</span>
                        <span class="value">${formatSalary(maxSalary, currency)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Track salary info update performance
    const endTime = performance.now();
    if (typeof gtag !== 'undefined') {
        gtag('event', 'salary_update', {
            'update_time': endTime - startTime,
            'country': country,
            'job_title': jobTitle,
            'event_category': 'Performance',
            'event_label': 'Salary Update'
        });
    }
}

// Update job listings
function updateJobListings(country, jobTitle) {
    const startTime = performance.now();
    const jobResults = document.getElementById('jobResults');
    const sortBy = document.getElementById('sortBy').value;
    
    let filteredJobs = jobsData.filter(job => 
        (!country || job.Country === country) &&
        (!jobTitle || job.JobTitle.toLowerCase().includes(jobTitle))
    );

    // Track job search with enhanced data
    if (typeof gtag !== 'undefined') {
        const searchTime = performance.now() - searchStartTime;
        gtag('event', 'job_search', {
            'country': country,
            'job_title': jobTitle,
            'results_count': filteredJobs.length,
            'sort_by': sortBy,
            'remote_jobs_count': filteredJobs.filter(job => job.Location.toLowerCase().includes('remote')).length,
            'search_time': searchTime,
            'event_category': 'Search',
            'event_label': 'Search Results',
            'user_type': localStorage.getItem('userType') || 'new',
            'job_category': getJobCategory(jobTitle),
            'search_term': jobTitle
        });
    }

    // Sort the filtered jobs
    filteredJobs.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.CreatedAt) - new Date(a.CreatedAt);
            case 'date-asc':
                return new Date(a.CreatedAt) - new Date(b.CreatedAt);
            case 'title-asc':
                return a.JobTitle.localeCompare(b.JobTitle);
            case 'title-desc':
                return b.JobTitle.localeCompare(a.JobTitle);
            case 'company-asc':
                return a.CompanyName.localeCompare(b.CompanyName);
            case 'company-desc':
                return b.CompanyName.localeCompare(a.CompanyName);
            default:
                return 0;
        }
    });

    if (filteredJobs.length === 0) {
        jobResults.innerHTML = `
            <div class="no-results">
                <p>No jobs found matching your criteria.</p>
            </div>
        `;
        return;
    }

    // Show job count
    const jobCount = document.createElement('div');
    jobCount.className = 'job-count';
    jobCount.textContent = `Found ${filteredJobs.length} jobs`;
    jobResults.innerHTML = '';
    jobResults.appendChild(jobCount);

    // Display jobs for current page
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const jobsToShow = filteredJobs.slice(startIndex, endIndex);

    jobsToShow.forEach(job => {
        const jobCard = createJobCard(job);
        jobResults.appendChild(jobCard);
    });

    // Add pagination if needed
    if (filteredJobs.length > jobsPerPage) {
        addPagination(filteredJobs.length);
    }

    // Track render performance
    const endTime = performance.now();
    performanceMetrics.renderTime = endTime - startTime;
    if (typeof gtag !== 'undefined') {
        gtag('event', 'render_update', {
            'render_time': performanceMetrics.renderTime,
            'jobs_rendered': jobsToShow.length,
            'event_category': 'Performance',
            'event_label': 'Job List Render'
        });
    }
}

// Create job card element
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const postedDate = new Date(job.CreatedAt);
    const formattedDate = postedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Check if job is remote based on location
    const isRemote = job.Location.toLowerCase().includes('remote');

    card.innerHTML = `
        <div class="job-header">
            <h3>${job.JobTitle}</h3>
            <div class="badge-container">
                ${isRemote ? '<span class="remote-badge">Remote</span>' : ''}
                <span class="job-type-badge">${job.NormalizedJob || 'Full-time'}</span>
            </div>
        </div>
        <div class="company">
            <strong>${job.CompanyName}</strong>
            <span class="location">${job.Location}</span>
        </div>
        <div class="job-details">
            <span>Posted: ${formattedDate}</span>
        </div>
        <div class="job-actions">
            <a href="${job.JobURL}" class="view-job-btn" target="_blank" onclick="trackJobClick('${job.JobID}')">
                View Job
            </a>
        </div>
    `;

    return card;
}

// Add pagination controls
function addPagination(totalJobs) {
    const totalPages = Math.ceil(totalJobs / jobsPerPage);
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    pagination.innerHTML = `
        <span>Page ${currentPage} of ${totalPages}</span>
        ${currentPage < totalPages ? `
            <button class="load-more-btn" onclick="loadMoreJobs()">
                Load More
            </button>
        ` : ''}
    `;
    
    document.getElementById('jobResults').appendChild(pagination);
}

// Load more jobs
function loadMoreJobs() {
    currentPage++;
    updateUI();
}

// Helper functions
function calculateAverageSalary(data) {
    // Use the correct column name from the CSV
    const salaries = data.map(item => parseFloat(item.MedianSalary));
    return salaries.reduce((a, b) => a + b, 0) / salaries.length;
}

function formatSalary(amount, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function convertCurrency(amount, fromCurrency, toCurrency) {
    // This is a simplified conversion. In a real app, you'd use an API
    const rates = {
        'EUR': 1,
        'USD': 1.1,
        'GBP': 0.85
    };
    return amount * (rates[toCurrency] / rates[fromCurrency]);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Track job clicks with enhanced data
function trackJobClick(jobId) {
    if (typeof gtag !== 'undefined') {
        const job = jobsData.find(job => job.JobID === jobId);
        gtag('event', 'job_click', {
            'job_id': jobId,
            'job_title': job?.JobTitle,
            'company': job?.CompanyName,
            'location': job?.Location,
            'job_type': job?.NormalizedJob,
            'is_remote': job?.Location.toLowerCase().includes('remote'),
            'country': job?.Country,
            'job_category': getJobCategory(job?.JobTitle),
            'click_position': getClickPosition(jobId),
            'time_to_click': performance.now() - searchStartTime,
            'event_category': 'Job Interaction',
            'event_label': 'Job Click'
        });
    }
}

// Track job saves
function saveJob(jobId) {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if (!savedJobs.includes(jobId)) {
        savedJobs.push(jobId);
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        
        // Track job save
        if (typeof gtag !== 'undefined') {
            const job = jobsData.find(job => job.JobID === jobId);
            gtag('event', 'job_save', {
                'job_id': jobId,
                'job_title': job?.JobTitle,
                'company': job?.CompanyName
            });
        }
        
        showToast('Job saved successfully!');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Helper function to categorize jobs
function getJobCategory(jobTitle) {
    const categories = {
        'developer': ['developer', 'engineer', 'programmer', 'coder'],
        'design': ['designer', 'ui', 'ux', 'graphic'],
        'management': ['manager', 'lead', 'head', 'director'],
        'marketing': ['marketing', 'seo', 'content', 'social'],
        'sales': ['sales', 'account', 'business development'],
        'other': []
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => jobTitle.toLowerCase().includes(keyword))) {
            return category;
        }
    }
    return 'other';
}

// Helper function to get click position
function getClickPosition(jobId) {
    const jobCards = document.querySelectorAll('.job-card');
    for (let i = 0; i < jobCards.length; i++) {
        if (jobCards[i].querySelector(`[data-job-id="${jobId}"]`)) {
            return i + 1;
        }
    }
    return 0;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.getElementById('countrySelect').addEventListener('change', updateUI);
    document.getElementById('jobInput').addEventListener('input', updateUI);
}); 