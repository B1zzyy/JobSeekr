import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import { PDFDocument } from 'pdf-lib'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const cvFile = formData.get('cv') as File
    const jobDescription = formData.get('jobDescription') as string

    if (!cvFile || !jobDescription) {
      return NextResponse.json(
        { error: 'CV file and job description are required' },
        { status: 400 }
      )
    }

    // Parse PDF to extract text
    const arrayBuffer = await cvFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const pdfData = await pdfParse(buffer)
    const cvText = pdfData.text

    // Use Gemini to generate cover letter (using free tier model: gemini-2.0-flash-lite)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    
    const prompt = `You are an expert cover letter writer who creates engaging, personalized cover letters that stand out from generic templates. Write a compelling cover letter that authentically connects the candidate's experience to the job requirements.

CRITICAL REQUIREMENTS:
- DO NOT include headers, addresses, dates, phone numbers, or email addresses
- DO NOT use placeholder text, brackets, or instructions for the user to fill in (e.g., no [Your Name], [Date], [Platform where you saw the advert], etc.)
- Start directly with a professional greeting (e.g., "Dear Hiring Manager,")
- Write a complete, ready-to-use cover letter that requires NO manual editing
- Write naturally without any brackets, placeholders, or incomplete sentences

WRITING STYLE GUIDELINES:
1. HOOK: Start with an engaging opening that shows genuine interest. Avoid generic phrases like "I am writing to express my interest" or "I am applying for the position of". Instead, open with something specific about the company, the role, or what excites the candidate about the opportunity.

2. TONE & PERSONALITY: Match the energy and tone of the company. For innovative, tech-forward companies (especially conversational AI, startups, or creative fields), use a more conversational, energetic tone while remaining professional. Show personality and enthusiasm authentically.

3. SPECIFICITY: Be specific about:
   - What about this particular role excites the candidate
   - How the candidate's specific experiences directly relate to the responsibilities
   - Specific projects, skills, or achievements from their CV that align with requirements
   - Understanding of the company's mission, values, or unique aspects mentioned in the job description

4. COMPANY CONTEXT: Reference specific details from the job description when relevant:
   - Company values or culture mentioned
   - Specific technologies, tools, or methodologies
   - Company mission or vision
   - Unique aspects of the role (e.g., "new graduates welcome", remote work, growth opportunities)

5. UNIQUENESS: Write in a way that feels personal and tailored. Avoid sounding like a template. Each sentence should feel intentional and specific to this candidate and this role.

6. STRUCTURE: 
   - Engaging opening paragraph with a strong hook
   - 2-3 body paragraphs that connect experience to specific requirements
   - Closing paragraph that reinforces interest and leaves a memorable impression
   - Professional closing (e.g., "Sincerely," or "Best regards,") followed by signature line

CV Information:

${cvText}

Job Description:

${jobDescription}

Generate a cover letter that stands out through its authenticity, specificity, and genuine connection to both the candidate's background and the role. Make it memorable and engaging while remaining professional.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let coverLetterText = response.text() || ''

    // Remove any placeholder patterns that might have slipped through
    coverLetterText = coverLetterText
      .replace(/\[.*?\]/g, '') // Remove any text in square brackets
      .replace(/\{.*?\}/g, '') // Remove any text in curly braces
      .replace(/\(.*?fill in.*?\)/gi, '') // Remove instructions like "(fill in)"
      .replace(/\(.*?e\.g\..*?\)/gi, '') // Remove examples like "(e.g., ...)"
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive blank lines
    
    // Sanitize text to remove characters that WinAnsi encoding can't handle
    coverLetterText = coverLetterText
      .replace(/[●•◦▪▫]/g, '•') // Replace various bullet points with simple bullet
      .replace(/['']/g, "'") // Replace curly quotes with straight quotes
      .replace(/[""]/g, '"') // Replace curly quotes with straight quotes
      .replace(/[–—]/g, '-') // Replace em/en dashes with hyphens

    // Create PDF with the cover letter
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([612, 792]) // US Letter size
    const { width, height } = page.getSize()

    const font = await pdfDoc.embedFont('Helvetica')
    const fontSize = 11
    const margin = 72 // 1 inch margin
    const maxWidth = width - 2 * margin
    const maxHeight = height - 2 * margin

    // Helper function to sanitize text for PDF (remove unsupported characters)
    const sanitizeForPDF = (text: string): string => {
      return text
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
        .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
        .trim()
    }

    // Split text into lines - handle newlines and wrap text
    // First split by actual newlines, then wrap each paragraph
    const paragraphs = coverLetterText.split(/\n+/).filter(p => p.trim())
    const lines: string[] = []

    for (const paragraph of paragraphs) {
      const sanitizedParagraph = sanitizeForPDF(paragraph)
      const words = sanitizedParagraph.split(/\s+/).filter(w => w)
      let currentLine = ''

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const textWidth = font.widthOfTextAtSize(testLine, fontSize)

        if (textWidth > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) {
        lines.push(currentLine)
      }
      lines.push('') // Add blank line between paragraphs
    }

    // Add text to PDF with proper formatting
    let currentPage = page
    let yPosition = height - margin
    const lineHeight = fontSize + 4

    for (const line of lines) {
      if (yPosition < margin + lineHeight) {
        currentPage = pdfDoc.addPage([612, 792])
        yPosition = height - margin
      }
      // Skip empty lines (they're just for spacing)
      if (line.trim()) {
        currentPage.drawText(line.trim(), {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: font,
        })
      }
      yPosition -= lineHeight
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cover-letter.pdf"',
      },
    })
  } catch (error) {
    console.error('Error generating cover letter:', error)
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    )
  }
}

