import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, surname, email, phone, password } = body;

    if (!name || !surname || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Lütfen ad, soyad, e-posta ve şifre alanlarını doldurunuz.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // E-posta kontrolü
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Bu e-posta adresi ile kayıtlı bir hesap zaten var. Lütfen giriş yapınız.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        surname: surname.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    // Otomatik Giriş Çerezi Oluştur
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 Gün
    });

    return NextResponse.json({
      success: true,
      message: 'Hesabınız başarıyla oluşturuldu!',
      data: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: 'Kayıt olurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}