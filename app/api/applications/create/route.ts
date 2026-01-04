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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    
    const prompt = `Extract the company name and job title/position from the following job description. Return ONLY a valid JSON object with these two fields: "companyName" and "jobTitle". If you cannot find a company name, use "Unknown Company". If you cannot find a job title, use "Unknown Position".

Job Description:
${jobDescription}

Return ONLY the JSON object, no markdown, no code blocks, no explanations. Just the raw JSON:
{
  "companyName": "...",
  "jobTitle": "..."
}`

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

