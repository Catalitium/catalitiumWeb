// Global variables
let jobData = [];
let salaryData = [];
let currentPage = 1;
const jobsPerPage = 10;
let searchStartTime = null;

// Cache DOM elements
const elements = {
    countrySelect: document.getElementById('countrySelect'),
    jobTitleInput: document.getElementById('jobTitleInput'),
    salaryInfo: document.getElementById('salaryInfo'),
    jobListings: document.getElementById('jobListings'),
    loading: document.getElementById('loading'),
    errorContainer: document.getElementById('errorContainer'),
    mainContent: document.getElementById('mainContent')
};

// Performance monitoring
const performanceMetrics = {
    dataLoadTime: 0,
    searchTime: 0,
    renderTime: 0
};

// Add this at the top of the file, after the global variables
const LOAD_TIMEOUT = 10000; // 10 seconds timeout

// Load data from CSV files
async function loadData() {
    try {
        console.log('Starting data load...');
        
        // Show loading spinner
        if (elements.loading) {
            elements.loading.classList.remove('hidden');
        }
        if (elements.mainContent) {
            elements.mainContent.classList.add('hidden');
        }
        if (elements.errorContainer) {
            elements.errorContainer.classList.add('hidden');
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
        updateUI();

        // Hide loading spinner and show content
        if (elements.loading) {
            elements.loading.classList.add('hidden');
        }
        if (elements.mainContent) {
            elements.mainContent.classList.remove('hidden');
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

        const headers = lines[0].split('\t').map(header => header.trim());
        console.log('CSV Headers:', headers);
        
        const data = lines.slice(1)
            .filter(line => line.trim()) // Remove empty lines
            .map((line, index) => {
                const values = line.split('\t').map(value => value.trim());
                if (values.length !== headers.length) {
                    console.warn(`Line ${index + 2} has incorrect number of columns:`, line);
                    return null;
                }
                return headers.reduce((obj, header, i) => {
                    obj[header] = values[i];
                    return obj;
                }, {});
            })
            .filter(obj => obj !== null); // Remove any null entries

        console.log(`Parsed ${data.length} rows successfully`);
        return data;
    } catch (error) {
        console.error('Error parsing CSV:', error);
        throw error; // Re-throw to be caught by loadData
    }
}

// Populate country options
function populateCountryOptions() {
    if (!elements.countrySelect) return;
    
    const countries = [...new Set(salaryData.map(item => item.Country))].sort();
    elements.countrySelect.innerHTML = `
        <option value="" data-en="All Countries" data-es="Todos los Países">All Countries</option>
        ${countries.map(country => `
            <option value="${country}">${country}</option>
        `).join('')}
    `;
}

// Update UI based on user input
function updateUI() {
    const country = elements.countrySelect?.value || '';
    const jobTitle = elements.jobTitleInput?.value || '';
    
    // Track search performance
    searchStartTime = performance.now();
    
    updateSalaryInfo(country, jobTitle);
    updateJobListings(country, jobTitle);
    
    // Log search performance
    const searchTime = performance.now() - searchStartTime;
    console.log(`Search completed in ${searchTime.toFixed(2)}ms`);
}

// Update salary information
function updateSalaryInfo(country, jobTitle) {
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

    if (filteredData.length === 0) {
        elements.salaryInfo.innerHTML = `
            <div class="text-center text-gray-600 dark:text-gray-300">
                <p data-en="No salary data available for the selected criteria" data-es="No hay datos salariales disponibles para los criterios seleccionados">
                    No salary data available for the selected criteria
                </p>
            </div>
        `;
        return;
    }

    // Debug log to check filtered data
    console.log('Filtered salary data:', filteredData);
    console.log('Total filtered jobs:', filteredJobs.length);

    const avgSalary = calculateAverageSalary(filteredData);
    const maxSalary = Math.max(...filteredData.map(item => {
        const salary = parseFloat(item.MedianSalary);
        return isNaN(salary) ? 0 : salary;
    }));
    const jobCount = filteredJobs.length;
    const currency = filteredData[0]?.CurrencyTicker || 'USD';

    // Debug log to check calculations
    console.log('Salary calculations:', {
        avgSalary,
        maxSalary,
        jobCount,
        currency,
        sampleSalaries: filteredData.slice(0, 3).map(item => item.MedianSalary)
    });

    elements.salaryInfo.innerHTML = `
        <div class="salary-stats">
            <div class="salary-range">
                <h3 class="text-2xl font-bold text-gray-900 mb-6">Salary Insights</h3>
                <div class="salary-metrics">
                    <div class="metric">
                        <span class="label">Average Salary</span>
                        <span class="value">${formatSalary(avgSalary, currency)}</span>
                        <div class="mt-2 text-sm text-gray-500">Based on ${filteredData.length} salary reports</div>
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

    // Track search metrics
    if (jobTitle) {
        trackSearchTermPopularity(jobTitle);
    }
    if (country) {
        trackCountrySearchPopularity(country);
    }
    trackJobSearch(jobTitle, country);

    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    if (filteredJobs.length === 0) {
        elements.jobListings.innerHTML = `
            <div class="text-center text-gray-600 dark:text-gray-300 p-8">
                <p data-en="No jobs found matching your criteria" data-es="No se encontraron trabajos que coincidan con tus criterios">
                    No jobs found matching your criteria
                </p>
            </div>
        `;
        return;
    }

    elements.jobListings.innerHTML = paginatedJobs.map(job => createJobCard(job)).join('');
    addPagination(filteredJobs.length);
}

// Create job card HTML
function createJobCard(job) {
    const isRemote = job.JobTitle.toLowerCase().includes('remote') || 
                    job.Location.toLowerCase().includes('remote');
    const salary = parseFloat(job.MedianSalary);
    const currency = job.CurrencyTicker || 'USD';
    const formattedSalary = formatSalary(salary, currency);
    const jobUrl = job.JobURL || job.Link || '#'; // Use JobURL or Link, fallback to #
    
    return `
        <div class="job-card bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div class="job-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">
                    <a href="${jobUrl}" target="_blank" class="hover:underline">${job.JobTitle}</a>
                </h3>
                <div class="badge-container flex flex-wrap gap-2">
                    ${isRemote ? `
                        <span class="remote-badge bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300">
                            <i class="fas fa-globe mr-1"></i>Remote
                        </span>
                    ` : ''}
                    <span class="job-type-badge bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                        <i class="fas fa-briefcase mr-1"></i>${job.JobType || 'Full-time'}
                    </span>
                </div>
            </div>
            
            <div class="company mb-4">
                <strong class="text-base sm:text-lg text-gray-800 dark:text-gray-200">${job.CompanyName}</strong>
                <p class="location text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    <i class="fas fa-map-marker-alt mr-1.5"></i>${job.Location}
                </p>
            </div>
            
            <div class="job-details grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div class="detail-item">
                    <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Experience</span>
                    <p class="text-sm sm:text-base text-gray-800 dark:text-gray-200">${job.Experience || 'Not specified'}</p>
                </div>
                <div class="detail-item">
                    <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Salary</span>
                    <p class="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-semibold">${formattedSalary}</p>
                </div>
            </div>
            
            <div class="job-actions mt-4">
                <a href="${jobUrl}" target="_blank" 
                   class="view-job-btn inline-flex items-center justify-center w-full bg-primary hover:bg-blue-600 text-white text-sm sm:text-base font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5">
                    <span data-en="Apply Now" data-es="Aplicar Ahora">Apply Now</span>
                    <i class="fas fa-arrow-right ml-2"></i>
                </a>
            </div>
        </div>
    `;
}

// Add pagination controls
function addPagination(totalJobs) {
    const totalPages = Math.ceil(totalJobs / jobsPerPage);
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 mb-4 px-4';
    
    // Page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'text-sm text-gray-600 dark:text-gray-400';
    pageInfo.innerHTML = `Showing ${Math.min((currentPage - 1) * jobsPerPage + 1, totalJobs)}-${Math.min(currentPage * jobsPerPage, totalJobs)} of ${totalJobs}`;
    
    // Navigation buttons container
    const navContainer = document.createElement('div');
    navContainer.className = 'flex items-center gap-2';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
        currentPage === 1 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
        : 'bg-white text-primary hover:bg-gray-50 border border-gray-200'
    }`;
    prevButton.disabled = currentPage === 1;
    prevButton.innerHTML = `
        <i class="fas fa-chevron-left mr-1"></i>
        <span class="hidden sm:inline" data-en="Previous" data-es="Anterior">Previous</span>
    `;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updateUI();
        }
    };
    
    // Page numbers
    const pageNumbers = document.createElement('div');
    pageNumbers.className = 'flex items-center gap-1';
    
    // Show first page, current page, and last page
    const pagesToShow = [];
    
    // Always show first page
    pagesToShow.push(1);
    
    // Show ellipsis if needed before current page
    if (currentPage > 3) {
        pagesToShow.push('...');
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (i > 1 && i < totalPages) {
            pagesToShow.push(i);
        }
    }
    
    // Show ellipsis if needed after current page
    if (currentPage < totalPages - 2) {
        pagesToShow.push('...');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
        pagesToShow.push(totalPages);
    }
    
    pagesToShow.forEach(page => {
        if (page === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 text-gray-500';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        } else {
            const pageButton = document.createElement('button');
            pageButton.className = `w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 text-sm ${
                currentPage === page 
                ? 'bg-primary text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`;
            pageButton.textContent = page;
            pageButton.onclick = () => {
                currentPage = page;
                updateUI();
            };
            pageNumbers.appendChild(pageButton);
        }
    });
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
        currentPage === totalPages 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
        : 'bg-white text-primary hover:bg-gray-50 border border-gray-200'
    }`;
    nextButton.disabled = currentPage === totalPages;
    nextButton.innerHTML = `
        <span class="hidden sm:inline" data-en="Next" data-es="Siguiente">Next</span>
        <i class="fas fa-chevron-right ml-1"></i>
    `;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateUI();
        }
    };
    
    navContainer.appendChild(prevButton);
    navContainer.appendChild(pageNumbers);
    navContainer.appendChild(nextButton);
    
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(navContainer);
    
    elements.jobListings.appendChild(paginationContainer);
}

// Helper function to calculate average salary
function calculateAverageSalary(jobs) {
    if (!jobs || jobs.length === 0) return 0;
    
    // Debug log to check input data
    console.log('Calculating average salary for jobs:', jobs.slice(0, 3));
    
    const validSalaries = jobs
        .map(job => {
            const salary = parseFloat(job.MedianSalary);
            return isNaN(salary) ? null : salary;
        })
        .filter(salary => salary !== null && salary > 0);
    
    // Debug log to check valid salaries
    console.log('Valid salaries:', validSalaries);
    
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

// Show error container
function showErrorContainer() {
    if (elements.loading) {
        elements.loading.classList.add('hidden');
    }
    if (elements.mainContent) {
        elements.mainContent.classList.add('hidden');
    }
    if (elements.errorContainer) {
        elements.errorContainer.classList.remove('hidden');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Add event listeners for search
    if (elements.countrySelect) {
        elements.countrySelect.addEventListener('change', () => {
            currentPage = 1; // Reset to first page on filter change
            updateUI();
        });
    }
    
    if (elements.jobTitleInput) {
        elements.jobTitleInput.addEventListener('input', () => {
            currentPage = 1; // Reset to first page on search
            updateUI();
        });
    }
});

gtag('event', 'job_search', {
  search_term: 'software engineer',
  country: 'Germany'
});
