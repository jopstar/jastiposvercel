import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products - Get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category,
        priceCNY: Number(body.priceCNY),
        image: body.image || '',
        description: body.description || '',
        weightGram: body.weightGram ? Number(body.weightGram) : null,
        originStore: body.originStore || null,
        isPopular: Boolean(body.isPopular),
        inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
