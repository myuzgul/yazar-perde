import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(1, 'Lütfen şifrenizi giriniz.'),
  rememberMe: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message || 'Lütfen bilgilerinizi kontrol ediniz.' },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = result.data;
    const cleanEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'E-posta adresi veya şifre hatalı.' },
        { status: 401 }
      );
    }

    if (user.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Bu hesap kapatılmıştır. Lütfen destek ile iletişime geçiniz.' },
        { status: 403 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'E-posta adresi veya şifre hatalı.' },
        { status: 401 }
      );
    }

    const tokenExpiry = rememberMe ? '30d' : '7d';
    const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
    }, tokenExpiry);

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı!',
      data: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Giriş yapılırken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}