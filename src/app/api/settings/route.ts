import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/lib/constants';

// GET /api/settings - Get app settings
export async function GET() {
  try {
    let settings = await prisma.appSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          id: 1,
          ...DEFAULT_SETTINGS,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings - Update app settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const settings = await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {
        ...(body.exchangeRateCNY !== undefined && { exchangeRateCNY: Number(body.exchangeRateCNY) }),
        ...(body.feePercentage !== undefined && { feePercentage: Number(body.feePercentage) }),
        ...(body.minFeeIDR !== undefined && { minFeeIDR: Number(body.minFeeIDR) }),
        ...(body.poTitle !== undefined && { poTitle: body.poTitle }),
        ...(body.poSubtitle !== undefined && { poSubtitle: body.poSubtitle }),
        ...(body.poOrigin !== undefined && { poOrigin: body.poOrigin }),
        ...(body.poCloseDate !== undefined && { poCloseDate: body.poCloseDate }),
        ...(body.estArrivalDate !== undefined && { estArrivalDate: body.estArrivalDate }),
        ...(body.estLocalShippingDate !== undefined && { estLocalShippingDate: body.estLocalShippingDate }),
        ...(body.adminWhatsapp !== undefined && { adminWhatsapp: body.adminWhatsapp }),
        ...(body.totalLuggageQuotaKg !== undefined && { totalLuggageQuotaKg: Number(body.totalLuggageQuotaKg) }),
        ...(body.usedLuggageQuotaKg !== undefined && { usedLuggageQuotaKg: Number(body.usedLuggageQuotaKg) }),
        ...(body.notificationBanner !== undefined && { notificationBanner: body.notificationBanner }),
      },
      create: {
        id: 1,
        ...DEFAULT_SETTINGS,
        ...body,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
