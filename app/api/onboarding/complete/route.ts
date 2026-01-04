import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update user metadata to mark onboarding as complete
    const { error } = await supabase.auth.updateUser({
      data: {
        hasCompletedOnboarding: true,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

