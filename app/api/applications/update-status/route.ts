import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const VALID_STATUSES = [
  'Applied',
  'Viewed',
  '1st Round Interviews',
  '2nd Round Interviews',
  'Final Round Interviews',
  'Rejected',
  'Accepted',
]

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId, status } = body

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 })
    }

    // Update application status
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .eq('user_id', user.id) // Ensure user can only update their own applications
      .select()
      .single()

    if (error) {
      console.error('Error updating application status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, application: data })
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

