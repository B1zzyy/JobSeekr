import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/utils/supabase/server'

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
    const jobDescription = formData.get('jobDescription') as string

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    // Get user's CV from storage
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cvFileName = user.user_metadata?.cvFileName

    if (!cvFileName) {
      return NextResponse.json(
        { error: 'No CV found. Please upload a CV in your settings.' },
        { status: 400 }
      )
    }

    // Download CV from storage
    const { data: cvFileData, error: downloadError } = await supabase.storage
      .from('cvs')
      .download(cvFileName)

    if (downloadError) {
      console.error('Error downloading CV:', downloadError)
      return NextResponse.json(
        { error: 'Failed to retrieve CV. Please try again.' },
        { status: 500 }
      )
    }

    // Parse PDF to extract text
    const arrayBuffer = await cvFileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const pdfData = await pdfParse(buffer)
    const cvText = pdfData.text

    // Use Gemini to generate recommendations (using free tier model: gemini-2.5-flash-lite)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    
    const prompt = `You are a CV optimizer. Your task is simple:

1. Read the job description and identify important keywords (technical skills, tools, technologies, soft skills, themes, etc.)
2. Check the CV to see if these keywords are present
3. For keywords that are MISSING from the CV, find the best place in the CV to add them naturally
4. Suggest specific text changes to integrate those keywords

For each recommendation, provide:
- "section": The CV section (e.g., "Experience", "Skills", "Summary")
- "location": Brief identifier (e.g., "Software Engineer at Company X", "Skills section")
- "currentText": The specific 1-2 sentences from the CV that should be modified (NOT the entire paragraph)
- "suggestedText": The improved version with keywords added (same length as currentText - 1-2 sentences)
- "keywords": Array of keywords from the job description being added
- "reason": Brief explanation

IMPORTANT:
- Only suggest keywords that appear in the job description
- Extract only 1-2 sentences that need to change, not entire paragraphs
- Aim for 5-7 recommendations if there are multiple missing keywords
- Only suggest changes where keywords can be naturally integrated into existing text

Return a JSON array with this structure:
[
  {
    "section": "Experience",
    "location": "Software Engineer at Company X",
    "currentText": "I developed web applications using React.",
    "suggestedText": "I developed web applications using React and Python.",
    "keywords": ["Python"],
    "reason": "Adds Python which is mentioned in the job description"
  }
]

Return ONLY the JSON array, no markdown, no explanations.

Original CV:
${cvText}

Job Description:
${jobDescription}
`

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
      
      // Helper function to count sentences (rough estimate)
      const countSentences = (text: string): number => {
        if (!text) return 0
        // Count sentence endings (. ! ?) but not abbreviations
        const matches = text.match(/[.!?]+/g)
        return matches ? matches.length : 1
      }
      
      // Helper function to check if a keyword appears in the job description (case-insensitive, flexible matching)
      const keywordInJobDescription = (keyword: string, jobDesc: string): boolean => {
        if (!keyword || !jobDesc) return false
        const keywordLower = keyword.toLowerCase().trim()
        const jobDescLower = jobDesc.toLowerCase()
        
        // First try exact phrase match
        if (jobDescLower.includes(keywordLower)) {
          return true
        }
        
        // Then try word-by-word match (all words must appear, but can be in different places)
        const keywordWords = keywordLower.split(/\s+/).filter(w => w.length > 2) // Filter out very short words
        if (keywordWords.length === 0) return false
        
        // If it's a single word, check if it appears
        if (keywordWords.length === 1) {
          return jobDescLower.includes(keywordWords[0])
        }
        
        // For multi-word phrases, check if all significant words appear
        return keywordWords.every(word => jobDescLower.includes(word))
      }
      
      // Filter out recommendations that don't actually change anything
      recommendations = recommendations.filter((rec) => {
        // Remove if currentText and suggestedText are the same (after trimming)
        if (rec.currentText?.trim() === rec.suggestedText?.trim()) {
          return false
        }
        
        // Remove if currentText is too long (more than 2 sentences)
        const currentSentences = countSentences(rec.currentText || '')
        if (currentSentences > 2) {
          return false
        }
        
        // Remove if suggestedText is too long (more than 2 sentences)
        const suggestedSentences = countSentences(rec.suggestedText || '')
        if (suggestedSentences > 2) {
          return false
        }
        
        // Remove if currentText is very long (more than 300 characters - likely a paragraph)
        if (rec.currentText && rec.currentText.length > 300) {
          return false
        }
        
        // Remove if suggestedText is very long (more than 300 characters - likely a paragraph)
        if (rec.suggestedText && rec.suggestedText.length > 300) {
          return false
        }
        
        // Remove if reason suggests no change is needed
        const reasonLower = rec.reason?.toLowerCase() || ''
        const noChangePhrases = [
          'nothing to change',
          'no change needed',
          'already good',
          'already optimal',
          'no changes required',
          'no modification needed',
          'is already',
          'already contains',
          'already includes',
          'no improvement needed'
        ]
        if (noChangePhrases.some(phrase => reasonLower.includes(phrase))) {
          return false
        }
        
        // Remove if no keywords are being added
        if (!rec.keywords || rec.keywords.length === 0) {
          return false
        }
        
        // CRITICAL: Remove if any keyword doesn't appear in the job description
        // All keywords must be found in the job description
        const allKeywordsValid = rec.keywords.every((keyword: string) => 
          keywordInJobDescription(keyword, jobDescription)
        )
        if (!allKeywordsValid) {
          return false
        }
        
        // Remove if suggestedText is empty or just whitespace
        if (!rec.suggestedText || rec.suggestedText.trim().length === 0) {
          return false
        }
        
        return true
      })
      
      // Limit to maximum 7 recommendations
      recommendations = recommendations.slice(0, 7)
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
