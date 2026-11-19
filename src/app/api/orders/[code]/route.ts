import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders/[code] - Get single order by booking code (for tracking)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const order = await prisma.order.findUnique({
      where: { bookingCode: code },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH /api/orders/[code] - Update order status or tracking number
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();

    const order = await prisma.order.update({
      where: { bookingCode: code },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.statusHistory !== undefined && { statusHistory: body.statusHistory }),
        ...(body.trackingNumber !== undefined && { trackingNumber: body.trackingNumber }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
