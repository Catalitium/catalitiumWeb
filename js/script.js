// Global variables
let jobData = [];
let salaryData = [];
let currentPage = 1;
const jobsPerPage = 10;
let searchStartTime = 0;

// Performance monitoring
const performanceMetrics = {
    dataLoadTime: 0,
    searchTime: 0,
    renderTime: 0
};

// Add this at the top of the file, after the global variables
const LOAD_TIMEOUT = 10000; // 10 seconds timeout

// Get DOM elements when needed
function getElements() {
    return {
        countrySelect: document.getElementById('countrySelect'),
        jobTitleInput: document.getElementById('jobTitleInput'),
        salaryInfo: document.getElementById('salaryInfo'),
        jobListings: document.getElementById('jobListings'),
        loading: document.getElementById('loading'),
        errorContainer: document.getElementById('errorContainer'),
        mainContent: document.getElementById('mainContent')
    };
}

// Initialize UI
function initializeUI() {
    const elements = getElements();
    
    // Add event listeners for search controls
    if (elements.countrySelect) {
        elements.countrySelect.addEventListener('change', function() {
            const country = this.value;
            if (country && typeof trackCountrySearchPopularity === 'function') {
                trackCountrySearchPopularity(country);
            }
            updateUI();
        });
    }
    
    if (elements.jobTitleInput) {
        let searchTimeout;
        elements.jobTitleInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const jobTitle = this.value.trim();
                if (jobTitle && typeof trackSearchTermPopularity === 'function') {
                    trackSearchTermPopularity(jobTitle);
                }
                updateUI();
            }, 500); // Debounce search to avoid too many analytics calls
        });
    }
}

// Load data from CSV files
async function loadData() {
    try {
        // Show loading spinner
        const elements = getElements();
        if (elements.loading) {
            elements.loading.style.display = 'flex';
        }
        if (elements.mainContent) {
            elements.mainContent.style.display = 'none';
        }
        if (elements.errorContainer) {
            elements.errorContainer.style.display = 'none';
        }

        // Load both files in parallel
        const [jobsResponse, salaryResponse] = await Promise.all([
            fetch('/data/jobs.csv'),
            fetch('/data/salary.csv')
        ]);

        if (!jobsResponse.ok || !salaryResponse.ok) {
            throw new Error('Failed to load data files');
        }

        const jobsText = await jobsResponse.text();
        const salaryText = await salaryResponse.text();

        if (!jobsText.trim() || !salaryText.trim()) {
            throw new Error('Data files are empty');
        }

        // Parse the CSV data
        jobData = parseCSV(jobsText);
        salaryData = parseCSV(salaryText);

        if (!jobData.length || !salaryData.length) {
            throw new Error('Failed to parse data');
        }

        // Initialize UI
        populateCountryOptions();
        initializeUI();
        updateUI();

        // Hide loading spinner and show content
        if (elements.loading) {
            elements.loading.style.display = 'none';
        }
        if (elements.mainContent) {
            elements.mainContent.style.display = 'block';
        }

    } catch (error) {
        console.error('Error loading data:', error);
        showErrorContainer();
    }
}

// Parse CSV text into array of objects
function parseCSV(text) {
    try {
        const lines = text.split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file is empty or has no data');
        }

        let headers = lines[0].split('\t').map(header => header.trim());
        
        const data = [];
        let currentHeaders = headers;
        let usaCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            const values = line.split('\t').map(value => value.trim());
            
            // Check if this line is a new header (starts with "JobID")
            if (values[0] === 'JobID') {
                currentHeaders = values;
                continue;
            }
            
            // Handle rows with different column counts
            if (values.length !== currentHeaders.length) {
                // If we have more values than headers, truncate
                if (values.length > currentHeaders.length) {
                    values.splice(currentHeaders.length);
                }
                // If we have fewer values than headers, pad with empty strings
                else if (values.length < currentHeaders.length) {
                    while (values.length < currentHeaders.length) {
                        values.push('');
                    }
                }
            }
            
            const obj = currentHeaders.reduce((obj, header, j) => {
                obj[header] = values[j] || '';
                return obj;
            }, {});
            
            // Count USA entries for debugging
            if (obj.Country === 'USA') {
                usaCount++;
            }
            
            data.push(obj);
        }

        return data;
    } catch (error) {
        console.error('Error parsing CSV:', error);
        throw error; // Re-throw to be caught by loadData
    }
}

// Populate country options
function populateCountryOptions() {
    const elements = getElements();
    if (!elements.countrySelect) return;
    
    // Get unique countries from both salary data and job data
    const salaryCountries = [...new Set(salaryData.map(item => item.Country))];
    const jobCountries = [...new Set(jobData.map(job => job.Country))];
    const allCountries = [...new Set([...salaryCountries, ...jobCountries])];
    
    // Sort countries: USA first, Spain second, then alphabetically
    const sortedCountries = allCountries.sort((a, b) => {
        if (a === 'USA') return -1;
        if (b === 'USA') return 1;
        if (a === 'Spain') return -1;
        if (b === 'Spain') return 1;
        return a.localeCompare(b);
    });
    
    elements.countrySelect.innerHTML = `
        <option value="" data-en="All Countries" data-es="Todos los Países">All Countries</option>
        ${sortedCountries.map(country => `
            <option value="${country}">${country}</option>
        `).join('')}
    `;
}

// Update UI based on user input
function updateUI() {
    const elements = getElements();
    const country = elements.countrySelect?.value || '';
    const jobTitle = elements.jobTitleInput?.value || '';
    
    // Track search with Google Analytics
    if (typeof trackJobSearch === 'function') {
        trackJobSearch(jobTitle, country);
    }
    
    // Track country selection
    if (country && typeof trackCountrySearchPopularity === 'function') {
        trackCountrySearchPopularity(country);
    }
    
    // Track search term popularity
    if (jobTitle && typeof trackSearchTermPopularity === 'function') {
        trackSearchTermPopularity(jobTitle);
    }
    
    // Track search performance
    searchStartTime = performance.now();
    
    updateSalaryInfo(country, jobTitle);
    updateJobListings(country, jobTitle);
    
    // Track search completion
    const searchTime = performance.now() - searchStartTime;
    if (typeof gtag === 'function') {
        gtag('event', 'search_completion', {
            'search_time_ms': Math.round(searchTime),
            'search_term': jobTitle,
            'country': country
        });
    }
}

// Update salary information
function updateSalaryInfo(country, jobTitle) {
    const elements = getElements();
    if (!elements.salaryInfo) return;

    let filteredData = salaryData;
    let filteredJobs = jobData;

    if (country) {
        filteredData = filteredData.filter(item => item.Country === country);
        filteredJobs = filteredJobs.filter(job => job.Country === country);
    }
    // Remove job title filtering from salary data to keep insights unchanged
    // Only filter jobs for the listings
    if (jobTitle) {
        const searchTerm = jobTitle.toLowerCase().trim();
        filteredJobs = filteredJobs.filter(job => 
            job.JobTitle.toLowerCase().includes(searchTerm)
        );
    }

    if (filteredData.length === 0 && filteredJobs.length === 0) {
        elements.salaryInfo.innerHTML = `
            <div class="text-center text-gray-600 dark:text-gray-300">
                <p data-en="No salary data available for the selected criteria" data-es="No hay datos salariales disponibles para los criterios seleccionados">
                    No salary data available for the selected criteria
                </p>
            </div>
        `;
        return;
    }

    let avgSalary = 0;
    let maxSalary = 0;
    let currency = 'USD';
    let jobCount = filteredJobs.length;

    // If we have salary data from the salary.csv file, use it
    if (filteredData.length > 0) {
        avgSalary = calculateAverageSalary(filteredData);
        maxSalary = Math.max(...filteredData.map(item => {
            const salary = parseFloat(item.MedianSalary);
            return isNaN(salary) ? 0 : salary;
        }));
        currency = filteredData[0]?.CurrencyTicker || 'USD';
    } else if (filteredJobs.length > 0) {
        // If no salary.csv data, try to extract from job salary column
        const validSalaries = filteredJobs
            .map(job => {
                if (job.Salary) {
                    // Extract numeric value from salary string like "$50,000 - $70,000" or "$40"
                    const salaryMatch = job.Salary.match(/\$?([\d,]+)/);
                    if (salaryMatch) {
                        return parseFloat(salaryMatch[1].replace(/,/g, ''));
                    }
                }
                return null;
            })
            .filter(salary => salary !== null && salary > 0);

        if (validSalaries.length > 0) {
            avgSalary = Math.round(validSalaries.reduce((a, b) => a + b, 0) / validSalaries.length);
            maxSalary = Math.max(...validSalaries);
        }
    }

    // Track salary insight view
    if (typeof trackSalaryInsight === 'function') {
        trackSalaryInsight(jobTitle || 'All Jobs', country || 'All Countries');
    }

    elements.salaryInfo.innerHTML = `
        <div class="salary-stats">
            <div class="salary-range">
                <h3 class="text-2xl font-bold text-gray-900 mb-6">Salary Insights</h3>
                <div class="salary-metrics">
                    <div class="metric">
                        <span class="label">Average Salary</span>
                        <span class="value">${formatSalary(avgSalary, currency)}</span>
                        <div class="mt-2 text-sm text-gray-500">Based on ${filteredJobs.length} job listings</div>
                    </div>
                    <div class="metric">
                        <span class="label">Maximum Salary</span>
                        <span class="value">${formatSalary(maxSalary, currency)}</span>
                        <div class="mt-2 text-sm text-gray-500">Top paying position</div>
                    </div>
                    <div class="metric">
                        <span class="label">Job Count</span>
                        <span class="value">${jobCount}</span>
                        <div class="mt-2 text-sm text-gray-500">Available positions</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update job listings
function updateJobListings(country, jobTitle) {
    const elements = getElements();
    if (!elements.jobListings) return;

    let filteredJobs = jobData;
    if (country) {
        filteredJobs = filteredJobs.filter(job => job.Country === country);
    }
    if (jobTitle) {
        const searchTerm = jobTitle.toLowerCase().trim();
        filteredJobs = filteredJobs.filter(job => 
            job.JobTitle.toLowerCase().includes(searchTerm)
        );
    }

    // Sort jobs by title for better search results
    filteredJobs.sort((a, b) => a.JobTitle.localeCompare(b.JobTitle));

    if (filteredJobs.length === 0) {
        elements.jobListings.innerHTML = `
            <div class="no-results">
                <p data-en="No jobs found matching your criteria" data-es="No se encontraron trabajos que coincidan con sus criterios">
                    No jobs found matching your criteria
                </p>
            </div>
        `;
        return;
    }

    // Use the createJobCard function from jobs.js if available, otherwise fallback
    const jobCardsHTML = filteredJobs.map(job => {
        if (typeof window.createJobCard === 'function') {
            return window.createJobCard(job);
        } else {
            // Fallback to basic card if createJobCard is not available
            const anonymizedCompany = anonymizeCompanyName(job.CompanyName);
            
            // Handle salary formatting
            let formattedSalary = 'N/A';
            if (job.Salary) {
                formattedSalary = job.Salary; // Use the new salary column directly
            } else if (job.MedianSalary) {
                formattedSalary = formatSalary(parseFloat(job.MedianSalary), job.CurrencyTicker || 'USD');
            }
            
            // Create simplified URL parameters
            const jobUrl = `job-apply.html?title=${encodeURIComponent(job.JobTitle)}&company=${encodeURIComponent(job.CompanyName)}&location=${encodeURIComponent(job.Location)}&salary=${encodeURIComponent(formattedSalary)}`;
            
            return `
                <div class="job-card">
                    <div class="job-header">
                        <h3>
                            <a href="${jobUrl}">${job.JobTitle}</a>
                        </h3>
                        <div class="badge-container">
                            <span class="job-type-badge">
                                <i class="fas fa-briefcase"></i>${job.JobType || 'Full-time'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="company">
                        <strong>${anonymizedCompany}</strong>
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
                        <a href="${jobUrl}" class="view-job-btn">
                            <span data-en="Apply Now" data-es="Aplicar Ahora">Apply Now</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
        }
    }).join('');

    elements.jobListings.innerHTML = jobCardsHTML;
}

// Helper function to calculate average salary
function calculateAverageSalary(jobs) {
    if (!jobs || jobs.length === 0) return 0;
    
    const validSalaries = jobs
        .map(job => {
            const salary = parseFloat(job.MedianSalary);
            return isNaN(salary) ? null : salary;
        })
        .filter(salary => salary !== null && salary > 0);
    
    if (validSalaries.length === 0) return 0;
    
    const average = validSalaries.reduce((a, b) => a + b, 0) / validSalaries.length;
    return Math.round(average);
}

// Helper function to format salary
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

// Make formatSalary globally available
window.formatSalary = formatSalary;

// Show error container
function showErrorContainer() {
    const elements = getElements();
    if (elements.loading) {
        elements.loading.style.display = 'none';
    }
    if (elements.mainContent) {
        elements.mainContent.style.display = 'none';
    }
    if (elements.errorContainer) {
        elements.errorContainer.style.display = 'block';
    }
}

// Function to anonymize company names
function anonymizeCompanyName(companyName) {
    if (!companyName || companyName.trim() === '') {
        return 'Company***';
    }
    
    // Handle different company name formats
    const name = companyName.trim();
    
    // If it's already anonymized, return as is
    if (name.includes('*')) {
        return name;
    }
    
    // Calculate how many characters to replace (40% of the name length)
    const totalLength = name.length;
    const charsToReplace = Math.ceil(totalLength * 0.4);
    
    // If the name is too short, just add *** at the end
    if (totalLength <= 3) {
        return `${name}***`;
    }
    
    // Create an array of character positions to replace
    const positionsToReplace = [];
    const step = Math.floor(totalLength / charsToReplace);
    
    for (let i = 0; i < charsToReplace; i++) {
        const pos = Math.floor(i * step) + Math.floor(step / 2);
        if (pos < totalLength && !positionsToReplace.includes(pos)) {
            positionsToReplace.push(pos);
        }
    }
    
    // Fill remaining positions if needed
    while (positionsToReplace.length < charsToReplace) {
        const randomPos = Math.floor(Math.random() * totalLength);
        if (!positionsToReplace.includes(randomPos)) {
            positionsToReplace.push(randomPos);
        }
    }
    
    // Sort positions to maintain order
    positionsToReplace.sort((a, b) => a - b);
    
    // Replace characters with asterisks
    let anonymizedName = '';
    for (let i = 0; i < totalLength; i++) {
        if (positionsToReplace.includes(i)) {
            anonymizedName += '*';
        } else {
            anonymizedName += name[i];
        }
    }
    
    return anonymizedName;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

gtag('event', 'job_search', {
  search_term: 'software engineer',
  country: 'Germany'
});
