import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders - Get all orders (for admin)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const order = await prisma.order.create({
      data: {
        bookingCode: body.bookingCode,
        customerName: body.customerName,
        whatsapp: body.whatsapp,
        address: body.address,
        city: body.city,
        postalCode: body.postalCode || null,
        courier: body.courier,
        paymentType: body.paymentType,
        subtotalItemsIDR: Number(body.subtotalItemsIDR),
        totalFeeIDR: Number(body.totalFeeIDR),
        grandTotalIDR: Number(body.grandTotalIDR),
        dpAmountIDR: Number(body.dpAmountIDR),
        remainingAmountIDR: Number(body.remainingAmountIDR),
        status: body.status || 'MENUNGGU_KONFIRMASI',
        trackingNumber: body.trackingNumber || null,
        notes: body.notes || null,
        items: body.items,
        statusHistory: body.statusHistory,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
