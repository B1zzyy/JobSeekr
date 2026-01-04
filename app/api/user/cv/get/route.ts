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
      return NextResponse.json({ cvFile: null })
    }

    // Generate a signed URL (valid for 1 hour) for secure access to private bucket
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('cvs')
      .createSignedUrl(cvFileName, 3600) // 1 hour expiry

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError)
      return NextResponse.json({ error: signedUrlError.message }, { status: 500 })
    }

    return NextResponse.json({
      cvFile: {
        fileName: cvFileName,
        url: signedUrlData.signedUrl,
      },
    })
  } catch (error) {
    console.error('Error getting CV:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
