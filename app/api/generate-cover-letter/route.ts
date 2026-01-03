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
    
    const prompt = `You are an expert cover letter writer. Write a professional, compelling cover letter that highlights the candidate's relevant experience from their CV and connects it to the job requirements. The cover letter should be well-structured, engaging, and tailored to the specific position.

CV Information:

${cvText}

Job Description:

${jobDescription}

Please generate a professional cover letter that connects the candidate's experience to the job requirements. Include a proper greeting, body paragraphs, and closing.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let coverLetterText = response.text() || ''

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

