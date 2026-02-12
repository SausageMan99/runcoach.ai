import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { count, error } = await supabase
            .from('programs')
            .select('user_id', { count: 'exact', head: true })

        if (error) throw error

        return NextResponse.json({ count: count || 0 })
    } catch (error) {
        console.error('Error fetching tester count:', error)
        return NextResponse.json({ count: 0 }, { status: 500 })
    }
}

export const revalidate = 3600
