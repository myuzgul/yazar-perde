import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCustomerSession, hashPassword, verifyPassword } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Giriş yapmalısınız' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, surname, phone, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name.trim();
    if (surname) updateData.surname = surname.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;

    // Şifre Değiştirme İsteği Varsa
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, message: 'Şifrenizi değiştirmek için mevcut şifrenizi girmelisiniz.' }, { status: 400 });
      }
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, message: 'Mevcut şifreniz hatalı.' }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profil bilgileriniz başarıyla güncellendi.',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, message: 'Güncelleme başarısız' }, { status: 500 });
  }
}