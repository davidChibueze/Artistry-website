interface OAuthTokenResponse {
  access_token: string
  token_type: 'Bearer'
  app_id: string
  expires_in: number
  scope: string
  nonce: string
}

interface PayPalAmount {
  currency_code: 'USD'
  value: string
}

interface PayPalCreateOrderResponse {
  id: string
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED'
  links?: { href: string; rel: string; method: string }[]
}

interface PayPalCapture {
  id: string
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED'
  amount: PayPalAmount
}

interface PayPalCaptureOrderResponse {
  id: string
  status: 'COMPLETED' | 'APPROVED' | 'VOIDED' | 'PAYER_ACTION_REQUIRED'
  purchase_units?: {
    reference_id?: string
    invoice_id?: string
    payments?: {
      captures?: PayPalCapture[]
    }
  }[]
  payer?: {
    email_address?: string
    payer_id?: string
    name?: { given_name?: string; surname?: string }
  }
}

interface WebhookVerifyResponse {
  verification_status: 'SUCCESS' | 'FAILURE'
}

function getApiBase(): string {
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase()
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
}

function getClientId(): string {
  const value = process.env.PAYPAL_CLIENT_ID
  if (!value) throw new Error('PAYPAL_CLIENT_ID is not set')
  return value
}

function getClientSecret(): string {
  const value = process.env.PAYPAL_CLIENT_SECRET
  if (!value) throw new Error('PAYPAL_CLIENT_SECRET is not set')
  return value
}

function getWebhookId(): string {
  const value = process.env.PAYPAL_WEBHOOK_ID
  if (!value) throw new Error('PAYPAL_WEBHOOK_ID is not set')
  return value
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value
  }

  const basic = Buffer.from(`${getClientId()}:${getClientSecret()}`).toString('base64')
  const response = await fetch(`${getApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`PayPal OAuth failed: ${response.status} ${text}`)
  }

  const data = (await response.json()) as OAuthTokenResponse
  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }
  return data.access_token
}

function formatAmount(value: number): string {
  return value.toFixed(2)
}

export interface CreateOrderArgs {
  amountUSD: number
  orderNumber: string
  customerEmail?: string
  returnUrl?: string
  cancelUrl?: string
}

export async function createOrder(args: CreateOrderArgs): Promise<PayPalCreateOrderResponse> {
  const token = await getAccessToken()
  const body = {
    intent: 'CAPTURE' as const,
    purchase_units: [
      {
        reference_id: args.orderNumber,
        invoice_id: args.orderNumber,
        amount: {
          currency_code: 'USD' as const,
          value: formatAmount(args.amountUSD),
        },
      },
    ],
    application_context: {
      brand_name: 'Poshbugati',
      user_action: 'PAY_NOW',
      return_url: args.returnUrl,
      cancel_url: args.cancelUrl,
    },
  }

  const response = await fetch(`${getApiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`PayPal createOrder failed: ${response.status} ${text}`)
  }
  return (await response.json()) as PayPalCreateOrderResponse
}

export async function captureOrder(paypalOrderId: string): Promise<PayPalCaptureOrderResponse> {
  const token = await getAccessToken()
  const response = await fetch(
    `${getApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`PayPal captureOrder failed: ${response.status} ${text}`)
  }
  return (await response.json()) as PayPalCaptureOrderResponse
}

export interface VerifyWebhookArgs {
  headers: Headers
  body: unknown
}

export async function verifyWebhookSignature(args: VerifyWebhookArgs): Promise<boolean> {
  const token = await getAccessToken()
  const verifyBody = {
    transmission_id: args.headers.get('paypal-transmission-id'),
    transmission_time: args.headers.get('paypal-transmission-time'),
    cert_url: args.headers.get('paypal-cert-url'),
    auth_algo: args.headers.get('paypal-auth-algo'),
    transmission_sig: args.headers.get('paypal-transmission-sig'),
    webhook_id: getWebhookId(),
    webhook_event: args.body,
  }

  if (
    !verifyBody.transmission_id ||
    !verifyBody.transmission_time ||
    !verifyBody.cert_url ||
    !verifyBody.auth_algo ||
    !verifyBody.transmission_sig
  ) {
    return false
  }

  const response = await fetch(`${getApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verifyBody),
  })

  if (!response.ok) return false
  const data = (await response.json()) as WebhookVerifyResponse
  return data.verification_status === 'SUCCESS'
}

export function findCaptureFromOrderResponse(
  resp: PayPalCaptureOrderResponse,
): PayPalCapture | null {
  for (const unit of resp.purchase_units ?? []) {
    const capture = unit.payments?.captures?.[0]
    if (capture) return capture
  }
  return null
}
