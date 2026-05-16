import type { Metadata } from 'next'

import { fetchOrderByToken } from '@/lib/orders'

import OrderView, { OrderNotFound } from './OrderView'

interface PageProps {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ t?: string }>
}

export const metadata: Metadata = {
  title: 'Order',
  robots: { index: false, follow: false },
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { orderNumber } = await params
  const { t } = await searchParams

  if (!t) return <OrderNotFound />
  const order = await fetchOrderByToken(orderNumber, t)
  if (!order) return <OrderNotFound />

  return <OrderView order={order} />
}
