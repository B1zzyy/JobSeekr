# JobSeekr - AI-Powered Job Application Assistant

A fully responsive Next.js web application that helps you optimize your CV and generate personalized cover letters using AI.

## Features

- 📄 **CV Upload**: Upload your existing CV in PDF format
- 🤖 **AI CV Optimization**: Automatically incorporate relevant keywords from job descriptions into your CV
- ✍️ **AI Cover Letter Generation**: Generate professional, tailored cover letters with a single click
- 📥 **PDF Downloads**: Download optimized CVs and cover letters as PDF files
- 🎨 **Beautiful UI**: Modern, responsive design with custom color palette
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey) - it's free!)

### Installation

1. Clone or navigate to the project directory:
```bash
cd JobSeekr
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

   **To get your free Gemini API key:**
   1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   2. Sign in with your Google account
   3. Click "Create API Key"
   4. Copy the API key and paste it in your `.env.local` file

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Your CV**: Drag and drop or click to upload your CV PDF file
2. **Enter Job Description**: Paste the job description for the position you're applying for
3. **Optimize CV**: Click "Optimize CV" to enhance your CV with relevant keywords
4. **Generate Cover Letter**: Click "Generate Cover Letter" to create a tailored cover letter
5. **Download**: Download your optimized CV and/or cover letter as PDF files

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Google Gemini API** - AI-powered CV optimization and cover letter generation (free!)
- **pdf-parse** - PDF text extraction
- **pdf-lib** - PDF generation
- **react-dropzone** - File upload component
- **lucide-react** - Icon library

## Project Structure

```
JobSeekr/
├── app/
│   ├── api/
│   │   ├── optimize-cv/        # API route for CV optimization
│   │   └── generate-cover-letter/  # API route for cover letter generation
│   ├── globals.css              # Global styles with color palette
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page component
├── components/
│   ├── ActionButtons.tsx        # Action buttons component
│   ├── CVUpload.tsx             # CV upload component
│   ├── JobDescriptionInput.tsx  # Job description textarea
│   └── StatusMessage.tsx        # Status message component
├── colour-paletter.md           # Color palette reference
└── package.json                 # Dependencies
```

## Environment Variables

Create a `.env.local` file with:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Building for Production

```bash
npm run build
npm start
```

## Notes

- The application uses Google's Gemini Pro model for AI processing (completely free!)
- PDF parsing and generation may have limitations with complex CV layouts
- For best results, use well-structured PDF CVs
- The AI will make subtle changes to incorporate keywords without fabricating experience

## License

This project is for personal use.

