// src/app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function supabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name: string, options: any) =>
          cookieStore.set({ name, value: '', ...options, maxAge: 0 }),
      },
    }
  )
}

export async function GET() {
  const supabase = supabaseServer()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true, profile: data ?? null })
}

export async function PUT(req: Request) {
  const supabase = supabaseServer()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const payload = await req.json().catch(() => ({} as any))
  // Whitelist fields
  const update = {
    id: user.id,
    company_name: typeof payload.company_name === 'string' ? payload.company_name : null,
    category: typeof payload.category === 'string' ? payload.category : null,
    wa_number: typeof payload.wa_number === 'string' ? payload.wa_number : null,
    timezone: typeof payload.timezone === 'string' ? payload.timezone : null,
    working_hours:
      payload.working_hours && typeof payload.working_hours === 'object'
        ? payload.working_hours
        : null,
    email: user.email ?? null, // keep email in sync (column already exists)
    name: payload.name && typeof payload.name === 'string' ? payload.name : null,
  }

  const { data, error } = await supabase.from('profiles').upsert(update).select('*').single()
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true, profile: data })
}
