import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const cvFile = formData.get('cv') as File

    if (!cvFile) {
      return NextResponse.json({ error: 'CV file is required' }, { status: 400 })
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await cvFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage (private bucket)
    const fileName = `${user.id}/${Date.now()}_${cvFile.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true, // Replace existing file
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Store only the file path in user metadata (not the URL, since we'll generate signed URLs)
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        cvFileName: fileName,
      },
    })

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fileName,
    })
  } catch (error) {
    console.error('Error uploading CV:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
