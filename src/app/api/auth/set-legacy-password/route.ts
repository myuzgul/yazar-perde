import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const setLegacyPasswordSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta adresi giriniz.'),
  newPassword: z.string().min(6, 'Şifreniz en az 6 karakter olmalıdır.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = setLegacyPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message || 'Lütfen bilgilerinizi kontrol ediniz.' },
        { status: 400 }
      );
    }

    const { email, newPassword } = result.data;
    const cleanEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    if (!user.mustSetPassword && !user.isLegacyMigrated) {
      return NextResponse.json(
        { success: false, message: 'Bu hesabın zaten tanımlı bir şifresi bulunmaktadır. Lütfen normal giriş yapınız veya şifremi unuttum seçeneğini kullanınız.' },
        { status: 400 }
      );
    }

    // Şifreyi hashle ve güncelle
    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        passwordHash: hashedPassword,
        mustSetPassword: false,
        isLegacyMigrated: false, // Artık yeni sistem şifresine sahip
      },
    });

    // Otomatik oturum aç
    const token = await createSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      surname: updatedUser.surname,
      role: updatedUser.role,
    }, '30d');

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    });

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla oluşturuldu! Hoş geldiniz.',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        surname: updatedUser.surname,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error('Set legacy password error:', error);
    return NextResponse.json(
      { success: false, message: 'Şifre kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
