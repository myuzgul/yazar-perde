import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const page = await prisma.staticPage.findUnique({ where: { id } });
      return NextResponse.json({ success: true, data: page });
    }

    const pages = await prisma.staticPage.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, contentHtml, seoTitle, seoDesc, isActive } = body;

    if (!title || !slug || !contentHtml) {
      return NextResponse.json({ success: false, error: 'Başlık, slug ve içerik zorunludur' }, { status: 400 });
    }

    const newPage = await prisma.staticPage.create({
      data: {
        title,
        slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
        contentHtml,
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: newPage });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, slug, contentHtml, seoTitle, seoDesc, isActive } = body;

    if (!id || !title || !slug || !contentHtml) {
      return NextResponse.json({ success: false, error: 'Eksik veri' }, { status: 400 });
    }

    const updated = await prisma.staticPage.update({
      where: { id },
      data: {
        title,
        slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
        contentHtml,
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID gerekli' }, { status: 400 });
    }

    await prisma.staticPage.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Sayfa silindi' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}