import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

// GET /api/subscriptions - List subscriptions with optional filters
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

    // Get query parameters from the URL
    const { searchParams } = new URL(request.url)
    const status_filter = searchParams.get('status_filter')
    const category = searchParams.get('category')
    const skip = searchParams.get('skip') || '0'
    const limit = searchParams.get('limit') || '100'

    // Build backend URL with query params
    const backendUrl = new URL(`${BACKEND_URL}/api/v1/subscriptions`)
    if (status_filter) backendUrl.searchParams.set('status_filter', status_filter)
    if (category) backendUrl.searchParams.set('category', category)
    backendUrl.searchParams.set('skip', skip)
    backendUrl.searchParams.set('limit', limit)

    // Call the FastAPI backend
    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to fetch subscriptions' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Subscriptions fetch error:', error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')

    if (!token) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Call the FastAPI backend to create subscription
    const response = await fetch(`${BACKEND_URL}/api/v1/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to create subscription' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
