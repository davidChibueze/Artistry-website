interface InitializePaymentArgs {
  amount: number
  email: string
  currency: 'NGN' | 'USD'
  reference: string
  callbackUrl: string
  customerFirstName?: string
  customerLastName?: string
  customerPhoneNumber?: string
  narration?: string
  metadata?: Record<string, string>
}

interface InitializePaymentResponse {
  status: number
  message: string
  data: {
    authorizationUrl: string
    reference: string
    credoReference: string
    crn: string
  }
}

interface VerifyTransactionResponse {
  status: number
  message: string
  data: {
    transRef: string
    businessRef: string
    debitedAmount: number
    transAmount: number
    transFeeAmount: number
    settlementAmount: number
    customerId: string
    transactionDate: string
    currencyCode: string
    status: number
  }
}

function getBaseURL(): string {
  return process.env.CREDO_BASE_URL || 'https://api.credodemo.com'
}

function getPublicKey(): string {
  const key = process.env.CREDO_PUBLIC_KEY
  if (!key) throw new Error('CREDO_PUBLIC_KEY is not set')
  return key
}

function getSecretKey(): string {
  const key = process.env.CREDO_SECRET_KEY
  if (!key) throw new Error('CREDO_SECRET_KEY is not set')
  return key
}

export async function initializePayment({
  amount,
  email,
  currency,
  reference,
  callbackUrl,
  customerFirstName,
  customerLastName,
  customerPhoneNumber,
  narration,
  metadata,
}: InitializePaymentArgs): Promise<InitializePaymentResponse> {
  const body: Record<string, unknown> = {
    amount,
    email,
    currency,
    bearer: 0,
    channels: ['CARD', 'BANK'],
    initializeAccount: 0,
    reference,
    callbackUrl,
  }

  if (customerFirstName) body.customerFirstName = customerFirstName
  if (customerLastName) body.customerLastName = customerLastName
  if (customerPhoneNumber) body.customerPhoneNumber = customerPhoneNumber
  if (narration) body.narration = narration
  if (metadata) {
    body.metadata = {
      customFields: Object.entries(metadata).map(([key, value]) => ({
        variable_name: key,
        value,
        display_name: key,
      })),
    }
  }

  const response = await fetch(`${getBaseURL()}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: getPublicKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Credo initialization failed: ${response.statusText}`)
  }

  return response.json() as Promise<InitializePaymentResponse>
}

export async function verifyTransaction(
  transRef: string
): Promise<VerifyTransactionResponse> {
  const response = await fetch(
    `${getBaseURL()}/transaction/${transRef}/verify`,
    {
      headers: {
        Authorization: getSecretKey(),
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Credo verification failed: ${response.statusText}`)
  }

  return response.json() as Promise<VerifyTransactionResponse>
}

export function toLowestUnit(amount: number, currency: 'NGN' | 'USD'): number {
  return Math.round(amount * 100)
}

export function fromLowestUnit(amount: number): number {
  return amount / 100
}
