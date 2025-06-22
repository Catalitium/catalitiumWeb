# Catalitium Job Explorer

A modern job search platform with real-time salary insights and global job opportunities.

## Features

- Real-time salary insights
- Global job listings
- Remote opportunities
- Career growth tracking
- Job market analytics
- Mobile-first responsive design
- Multi-language support (English/Spanish)
- Advanced search and filtering
- Salary range visualization
- Company insights
- **Job Application Form** with file upload and validation

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Google Analytics
- Google Tag Manager
- CSV Data Integration
- Netlify Forms Integration

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/catalitium.git
```

2. Navigate to the project directory:
```bash
cd catalitium
```

3. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

4. Visit `http://localhost:8000` in your browser

## Project Structure

```
catalitium/
├── css/
│   ├── style.css          # Base styles
│   └── job-apply.css      # Job application form styles
├── js/
│   ├── script.js          # Main application logic
│   ├── main.js            # Additional utilities
│   └── job-apply.js       # Job application form logic
├── data/
│   ├── jobs.csv           # Job listings data
│   └── salary.csv         # Salary information data
├── images/
├── assets/
├── index.html             # Homepage
├── jobs.html              # Job search page
├── job-apply.html         # Job application form
├── about.html
├── contact.html
├── services.html
├── support.html
├── privacy-policy.html
├── terms-of-service.html
├── 404.html
├── GenAiModels.html
└── README.md
```

## Key Pages

- **Homepage** (`index.html`): Main landing page with company overview
- **Job Search** (`jobs.html`): Interactive job search with filtering and salary insights
- **Job Application** (`job-apply.html`): Clean, accessible application form with file upload
- **About** (`about.html`): Company information and team details
- **Contact** (`contact.html`): Contact information and form

## Job Application Form

The job application form (`job-apply.html`) features:
- **Clean, accessible design** with modern UI/UX
- **File upload validation** (PDF, DOC, DOCX, max 5MB)
- **Email validation** with real-time feedback
- **Work permit toggle** for international applications
- **Netlify integration** for form handling
- **Google Analytics tracking** for form interactions
- **Mobile-responsive** design
- **Keyboard accessibility** support

## Data Sources

The job and salary data is stored in CSV format:
- `jobs.csv`: Contains job listings with details like title, company, location, etc.
- `salary.csv`: Contains salary information for different positions and locations

## Analytics

The platform uses Google Analytics and Google Tag Manager to track:
- Job searches
- Salary insights views
- User interactions
- Search patterns
- Country-specific analytics
- Form submissions
- File uploads

## Deployment

The project is optimized for deployment on:
- **Netlify** (recommended for form handling)
- **GitHub Pages**
- **Vercel**
- Any static hosting service

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Catalitium - info@catalitium.com

Project Link: [https://github.com/yourusername/catalitium](https://github.com/yourusername/catalitium) 