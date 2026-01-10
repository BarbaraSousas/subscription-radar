import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    console.log('[Dashboard] BACKEND_URL from env:', process.env.BACKEND_URL)
    console.log('[Dashboard] BACKEND_URL constant:', BACKEND_URL)

    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')

    console.log('[Dashboard] Token present:', !!token)
    console.log('[Dashboard] Token value length:', token?.value?.length)

    if (!token) {
      console.log('[Dashboard] No auth token found')
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Call the FastAPI backend to get dashboard stats
    const backendUrl = `${BACKEND_URL}/api/v1/subscriptions/dashboard`
    console.log('[Dashboard] Full backend URL:', backendUrl)
    console.log('[Dashboard] Auth token (first 30 chars):', token.value?.substring(0, 30) + '...')

    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    console.log('[Dashboard] Backend response status:', response.status)
    console.log('[Dashboard] Backend response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const responseText = await response.text()
      console.log('[Dashboard] Backend error response:', responseText)

      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { detail: responseText }
      }
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to fetch dashboard stats' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to fetch dashboard' },
      { status: 500 }
    )
  }
}
