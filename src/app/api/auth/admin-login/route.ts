import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'E-posta veya şifre hatalı.' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, message: 'Bu panele giriş yetkiniz bulunmamaktadır.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'E-posta veya şifre hatalı.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
      message: 'Giriş başarılı.',
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
