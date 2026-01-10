import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')

    if (!token) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '30'

    const backendUrl = new URL(`${BACKEND_URL}/api/v1/analytics/upcoming`)
    backendUrl.searchParams.set('days', days)

    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to fetch upcoming renewals' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Upcoming renewals fetch error:', error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to fetch upcoming renewals' },
      { status: 500 }
    )
  }
}
