import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get CV file path from user metadata
    const cvFileName = user.user_metadata?.cvFileName

    if (!cvFileName) {
      return NextResponse.json({ error: 'No CV found' }, { status: 404 })
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cvs')
      .download(cvFileName)

    if (downloadError) {
      console.error('Error downloading CV:', downloadError)
      return NextResponse.json({ error: downloadError.message }, { status: 500 })
    }

    // Convert blob to buffer and return as PDF
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cv.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error downloading CV:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

