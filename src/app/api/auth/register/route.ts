import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Adınız en az 2 karakter olmalıdır.'),
  surname: z.string().trim().min(2, 'Soyadınız en az 2 karakter olmalıdır.'),
  email: z.string().trim().email('Geçerli bir e-posta adresi giriniz.'),
  phone: z.string().trim().optional().nullable(),
  password: z.string().min(6, 'Şifreniz en az 6 karakter olmalıdır.'),
  passwordConfirm: z.string().optional(),
  agreeTerms: z.boolean().optional(),
}).refine((data) => {
  if (data.passwordConfirm && data.password !== data.passwordConfirm) {
    return false;
  }
  return true;
}, {
  message: 'Girdiğiniz şifreler birbiriyle eşleşmiyor.',
  path: ['passwordConfirm'],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message || 'Lütfen form alanlarını kontrol ediniz.' },
        { status: 400 }
      );
    }

    const { name, surname, email, phone, password } = result.data;
    const cleanEmail = email.toLowerCase();

    // E-posta mükerrerlik kontrolü
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      // Eğer eski sistemden aktarılan üye ise ve ilk kez şifre belirliyorsa kaydı aktifleştir
      if (existing.mustSetPassword || existing.isLegacyMigrated) {
        const hashedPassword = await hashPassword(password);
        const updatedUser = await prisma.user.update({
          where: { email: cleanEmail },
          data: {
            name: name || existing.name,
            surname: surname || existing.surname,
            phone: phone || existing.phone,
            passwordHash: hashedPassword,
            mustSetPassword: false,
            isLegacyMigrated: false,
          },
        });

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
          maxAge: 60 * 60 * 24 * 30,
        });

        return NextResponse.json({
          success: true,
          message: 'Eski sitemizdeki üyeliğiniz başarıyla aktifleştirildi! Hoş geldiniz.',
          data: {
            id: updatedUser.id,
            name: updatedUser.name,
            surname: updatedUser.surname,
            email: updatedUser.email,
            phone: updatedUser.phone,
          },
        });
      }

      return NextResponse.json(
        { success: false, message: 'Bu e-posta adresiyle kayıtlı bir hesap zaten mevcut. Lütfen giriş yapınız.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email: cleanEmail,
        phone: phone || null,
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
        isEmailVerified: false,
        isDeleted: false,
      },
    });

    // Otomatik Giriş Çerezi Oluştur
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
    }, '30d');

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
      { success: false, message: 'Kayıt işlemi sırasında bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}