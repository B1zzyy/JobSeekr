import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

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

    // Use Gemini to generate recommendations (using free tier model: gemini-2.0-flash-lite)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    
    const prompt = `You are an expert CV optimizer. Analyze the CV and job description, then provide specific, actionable recommendations for where to add keywords and what text to modify.

INSTRUCTIONS:
1. Extract key skills, technologies, qualifications, and important phrases from the job description
2. Identify 3-8 specific places in the CV where these keywords should be naturally integrated
3. For each recommendation, provide:
   - The exact section name from the CV (e.g., "Experience", "Skills", "Summary", "Education")
   - A CONCISE location identifier (e.g., "Software Engineer at Company X", "Additional Skills section", "Professional Summary", "Education - University Name"). This should be a brief label, NOT the actual text content from the CV
   - The current text that should be modified (copy it exactly as written)
   - The suggested improved text with keywords naturally integrated
   - The specific keywords being added
   - A brief reason explaining why this change helps match the job description

IMPORTANT GUIDELINES:
- Only suggest changes that naturally integrate keywords into existing content. Do NOT suggest adding completely new experiences or qualifications. Focus on enhancing what's already there.
- The "location" field should be a SHORT identifier (1-10 words max), like a job title, section name, or brief label. DO NOT include the actual bullet points or text content in the location field.
- Examples of good locations: "Software Engineer - Company ABC", "Skills section", "Professional Summary", "Education - University Name"
- Examples of BAD locations: Long text strings, bullet points, or full sentences from the CV

Return your response as a valid JSON array. Each recommendation must have these exact fields:
{
  "section": "string (e.g., 'Experience', 'Skills', 'Summary', 'Education')",
  "location": "string (SHORT identifier like 'Job Title at Company', 'Skills section', NOT the actual text content)",
  "currentText": "string (the exact current text from the CV)",
  "suggestedText": "string (the improved text with keywords integrated)",
  "keywords": ["keyword1", "keyword2"],
  "reason": "string (brief explanation of why this helps)"
}

CRITICAL: Return ONLY the JSON array. No markdown formatting, no code blocks, no explanations before or after. Just the raw JSON array starting with [ and ending with ].

Original CV:
${cvText}

Job Description:
${jobDescription}

Now return the JSON array of recommendations:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let recommendationsText = response.text() || '[]'

    // Clean up the response (remove markdown code blocks if present)
    recommendationsText = recommendationsText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let recommendations: Array<{
      section: string
      location: string
      currentText: string
      suggestedText: string
      keywords: string[]
      reason: string
    }> = []

    try {
      recommendations = JSON.parse(recommendationsText)
      // Ensure it's an array
      if (!Array.isArray(recommendations)) {
        recommendations = []
      }
    } catch (parseError) {
      console.error('Failed to parse recommendations JSON:', parseError)
      console.error('Raw response:', recommendationsText)
      // If JSON parsing fails, create a fallback recommendation
      recommendations = [{
        section: 'CV',
        location: 'Various sections',
        currentText: 'See CV text above',
        suggestedText: 'Review the AI response for suggestions',
        keywords: [],
        reason: 'Could not parse structured recommendations. Please review the response manually.'
      }]
    }

    return NextResponse.json({
      recommendations,
      success: true,
    })
  } catch (error: any) {
    console.error('Error optimizing CV:', error)
    const errorMessage = error?.message || 'Failed to optimize CV'
    return NextResponse.json(
      { error: errorMessage, details: error?.toString() },
      { status: 500 }
    )
  }
}
