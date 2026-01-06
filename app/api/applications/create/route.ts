import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { jobDescription } = body

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    // Use AI to extract company name and job position from job description
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    
    const prompt = `Extract the company name and job title/position from the following job description.

IMPORTANT RULES:
1. COMPANY NAME: Only extract if explicitly mentioned. Look for patterns like "at [Company]", "Company:", "Join [Company]", "[Company] is looking for", etc. If not clearly stated, use "Unknown Company". DO NOT guess or infer the company name.

2. JOB TITLE/POSITION: Be more flexible here. Look for:
   - Explicit job titles (e.g., "Software Engineer", "Frontend Developer", "React Developer")
   - If no explicit title but technologies/stack are heavily mentioned (e.g., React, Python, etc.), infer a reasonable title (e.g., "React Developer", "Python Developer", "Full Stack Developer")
   - If the role heavily focuses on a specific technology or domain, create an appropriate title based on that (e.g., if it's all about React/JavaScript frontend work, use "Frontend Developer" or "React Developer")
   - Only use "Unknown Position" if the job description is too vague or generic to infer any meaningful title

Return ONLY a valid JSON object with these two fields: "companyName" and "jobTitle". No markdown, no code blocks, no explanations. Just the raw JSON:
{
  "companyName": "...",
  "jobTitle": "..."
}

Job Description:
${jobDescription}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    // Parse the JSON response
    let companyName = 'Unknown Company'
    let jobTitle = 'Unknown Position'
    
    try {
      // Remove markdown code blocks if present
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(jsonText)
      companyName = parsed.companyName || 'Unknown Company'
      jobTitle = parsed.jobTitle || 'Unknown Position'
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('AI response was:', text)
    }

    // Insert application into database (only save essential fields)
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_title: jobTitle,
        company_name: companyName,
        status: 'Applied',
        applied_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating application:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, application: data })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

