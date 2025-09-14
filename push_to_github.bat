@echo off
echo Adding all files to git...
git add .

echo Committing changes...
git commit -m "Add complete ERP system with Companies, Locations, Departments, Packages, and Package Features

- Added Company management with full CRUD operations
- Added Location management with company-based filtering  
- Added Department management with location-based filtering
- Added Package and Package Features management
- Created responsive React components with advanced table features
- Added sidebar navigation with dynamic menu highlighting
- Implemented search, filtering, pagination, and bulk operations
- Added comprehensive form validation and error handling
- Created database migrations and seeders with sample data
- Integrated Inertia.js with Laravel backend"

echo Pushing to GitHub...
git push origin main

echo Done! Your ERP project has been pushed to GitHub.
pause
