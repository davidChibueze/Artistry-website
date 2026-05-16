import { NextRequest, NextResponse } from 'next/server'

const ADMIN_API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
  'content-encoding',
])

interface Context {
  params: Promise<{ path: string[] }>
}

async function forward(req: NextRequest, ctx: Context, method: string): Promise<NextResponse> {
  const { path } = await ctx.params
  const targetPath = '/' + path.map(encodeURIComponent).join('/')
  const search = req.nextUrl.searchParams.toString()
  const targetUrl = `${ADMIN_API}${targetPath}${search ? `?${search}` : ''}`

  const headers = new Headers()
  for (const [key, value] of req.headers.entries()) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue
    headers.set(key, value)
  }

  const init: RequestInit = {
    method,
    headers,
    cache: 'no-store',
    redirect: 'manual',
  }
  if (method !== 'GET' && method !== 'HEAD') {
    const body = await req.arrayBuffer()
    if (body.byteLength > 0) init.body = body
  }

  const upstream = await fetch(targetUrl, init)

  const responseHeaders = new Headers()
  for (const [key, value] of upstream.headers.entries()) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue
    if (key.toLowerCase() === 'set-cookie') continue
    responseHeaders.set(key, value)
  }

  // Set-Cookie may appear multiple times; copy each entry through verbatim
  // so httpOnly cart_id / customer_token / pref_currency cookies survive the proxy.
  const setCookieHeader =
    typeof (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === 'function'
      ? (upstream.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
      : upstream.headers.get('set-cookie')
        ? [upstream.headers.get('set-cookie') as string]
        : []
  for (const cookie of setCookieHeader) responseHeaders.append('set-cookie', cookie)

  const responseBody = await upstream.arrayBuffer()
  return new NextResponse(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export async function GET(req: NextRequest, ctx: Context) {
  return forward(req, ctx, 'GET')
}
export async function POST(req: NextRequest, ctx: Context) {
  return forward(req, ctx, 'POST')
}
export async function PATCH(req: NextRequest, ctx: Context) {
  return forward(req, ctx, 'PATCH')
}
export async function PUT(req: NextRequest, ctx: Context) {
  return forward(req, ctx, 'PUT')
}
export async function DELETE(req: NextRequest, ctx: Context) {
  return forward(req, ctx, 'DELETE')
}
