import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefaultDelivery: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json({ success: false, message: 'Adresler yüklenemedi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      addressType,
      name,
      surname,
      companyName,
      taxNo,
      taxOffice,
      phone,
      city,
      district,
      fullAddress,
      postalCode,
      isDefaultDelivery,
      isDefaultBilling,
    } = body;

    if (!title || !name || !surname || !phone || !city || !district || !fullAddress) {
      return NextResponse.json({ success: false, message: 'Lütfen zorunlu adres alanlarını doldurunuz.' }, { status: 400 });
    }

    // Eğer varsayılan olarak işaretlendiyse diğerlerini sıfırla
    if (isDefaultDelivery) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefaultDelivery: false },
      });
    }
    if (isDefaultBilling) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefaultBilling: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        addressType: addressType || 'INDIVIDUAL',
        name: name.trim(),
        surname: surname.trim(),
        companyName: companyName ? companyName.trim() : null,
        taxNo: taxNo ? taxNo.trim() : null,
        taxOffice: taxOffice ? taxOffice.trim() : null,
        phone: phone.trim(),
        city: city.trim(),
        district: district.trim(),
        fullAddress: fullAddress.trim(),
        postalCode: postalCode ? postalCode.trim() : null,
        isDefaultDelivery: Boolean(isDefaultDelivery),
        isDefaultBilling: Boolean(isDefaultBilling),
      },
    });

    return NextResponse.json({ success: true, message: 'Adres başarıyla eklendi.', data: address });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ success: false, message: 'Adres eklenirken bir hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      title,
      addressType,
      name,
      surname,
      companyName,
      taxNo,
      taxOffice,
      phone,
      city,
      district,
      fullAddress,
      postalCode,
      isDefaultDelivery,
      isDefaultBilling,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Adres ID gerekli' }, { status: 400 });
    }

    // Yetki kontrolü (Adres bu kullanıcıya mı ait?)
    const existing = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Adres bulunamadı' }, { status: 404 });
    }

    if (isDefaultDelivery) {
      await prisma.address.updateMany({
        where: { userId: session.userId, id: { not: id } },
        data: { isDefaultDelivery: false },
      });
    }
    if (isDefaultBilling) {
      await prisma.address.updateMany({
        where: { userId: session.userId, id: { not: id } },
        data: { isDefaultBilling: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        title: title ? title.trim() : undefined,
        addressType: addressType || undefined,
        name: name ? name.trim() : undefined,
        surname: surname ? surname.trim() : undefined,
        companyName: companyName !== undefined ? companyName : undefined,
        taxNo: taxNo !== undefined ? taxNo : undefined,
        taxOffice: taxOffice !== undefined ? taxOffice : undefined,
        phone: phone ? phone.trim() : undefined,
        city: city ? city.trim() : undefined,
        district: district ? district.trim() : undefined,
        fullAddress: fullAddress ? fullAddress.trim() : undefined,
        postalCode: postalCode !== undefined ? postalCode : undefined,
        isDefaultDelivery: isDefaultDelivery !== undefined ? Boolean(isDefaultDelivery) : undefined,
        isDefaultBilling: isDefaultBilling !== undefined ? Boolean(isDefaultBilling) : undefined,
      },
    });

    return NextResponse.json({ success: true, message: 'Adres güncellendi.', data: updated });
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json({ success: false, message: 'Adres güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID gerekli' }, { status: 400 });

    const existing = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Adres bulunamadı' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Adres silindi.' });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ success: false, message: 'Adres silinemedi' }, { status: 500 });
  }
}