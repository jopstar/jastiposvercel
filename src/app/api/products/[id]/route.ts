import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.priceCNY !== undefined && { priceCNY: Number(body.priceCNY) }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.weightGram !== undefined && { weightGram: body.weightGram ? Number(body.weightGram) : null }),
        ...(body.originStore !== undefined && { originStore: body.originStore }),
        ...(body.isPopular !== undefined && { isPopular: Boolean(body.isPopular) }),
        ...(body.inStock !== undefined && { inStock: Boolean(body.inStock) }),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
