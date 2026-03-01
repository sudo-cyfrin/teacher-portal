# Teacher Portal - Academic Records Management System

A professional web application for teachers to manage and view student academic records. This portal integrates with Airtable to provide real-time access to student assessment data synchronized from Google Forms via n8n workflows.

## Features

- **Teacher Authentication**: Secure login system for faculty members
- **Dashboard**: Overview with quick access to all features and Google Form links
- **Class Details**: View complete class performance by year and subject
- **Student Search**: Search individual students by year and roll number
- **Real-time Data**: Live synchronization with Airtable database
- **Professional UI**: Modern, responsive design with Tailwind CSS
- **Export Functionality**: Download class data as CSV files

## Architecture

This portal is part of an edge-hosted academic record synchronization system:

1. **Data Entry**: Faculty enter assessment data via Google Forms
2. **Processing**: Google Sheets calculate derived values (totals, averages, etc.)
3. **Synchronization**: n8n on Raspberry Pi syncs data to Airtable
4. **Access**: Teachers use this portal to view and analyze student records

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: NextAuth.js with credentials provider
- **Database**: Airtable API integration
- **UI Components**: Radix UI primitives with custom components
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Airtable API key and Base ID
- Google Form URL for data entry

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd teacher-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Airtable Configuration
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_STUDENTS_TABLE=Students
AIRTABLE_TEACHERS_TABLE=Teachers

# Google Form Link
GOOGLE_FORM_LINK=https://docs.google.com/forms/d/your-form-id/viewform
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Airtable Setup

### Students Table Structure

Your Airtable Students table should include these fields:

- `Name` (Single line text)
- `RollNumber` (Single line text)
- `Year` (Single line text)
- Subject-specific fields (e.g., `Math_Test1`, `Math_Test2`, `Math_Lab1`, etc.)
- `TermWork` (Number)
- `OverallGrade` (Single line text)

### Teachers Table Structure

- `Name` (Single line text)
- `Email` (Email)
- `Department` (Single line text)

## Usage

### Login

1. Navigate to `/login`
2. Enter your teacher credentials (email and password)
3. For demo: Use any email with a 4+ character password

### Dashboard

The main dashboard provides:
- Overview statistics
- Quick access to all features
- Direct link to Google Form for data entry
- Recent activity feed

### Class Details

1. Go to `/class-details`
2. Select academic year and subject
3. View complete class performance with statistics
4. Export data as CSV if needed

### Student Search

1. Navigate to `/search`
2. Enter year and roll number
3. View complete academic record for the student
4. See performance across all subjects

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/auth/          # NextAuth.js API routes
│   ├── dashboard/         # Dashboard page
│   ├── class-details/     # Class performance page
│   ├── search/            # Student search page
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/
│   ├── airtable.ts        # Airtable API service
│   ├── auth.ts            # NextAuth configuration
│   └── utils.ts           # Utility functions
└── types/
    └── next-auth.d.ts     # NextAuth type extensions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Yes |
| `AIRTABLE_API_KEY` | Airtable API key | Yes |
| `AIRTABLE_BASE_ID` | Airtable Base ID | Yes |
| `AIRTABLE_STUDENTS_TABLE` | Students table name | No (default: "Students") |
| `AIRTABLE_TEACHERS_TABLE` | Teachers table name | No (default: "Teachers") |
| `GOOGLE_FORM_LINK` | Google Form URL | No |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker

```bash
# Build the image
docker build -t teacher-portal .

# Run the container
docker run -p 3000:3000 --env-file .env.local teacher-portal
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Note**: This application is designed to work with the complete academic record synchronization system. Ensure your n8n workflows and Airtable setup are properly configured for optimal functionality.
