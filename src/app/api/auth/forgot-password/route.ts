import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Lütfen e-posta adresinizi giriniz.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (user && !user.isDeleted) {
      // 32-byte güvenli token üret
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 saat geçerli

      // Varsa eski kullanılmamış tokenları temizle
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const resetUrl = `${protocol}://${host}/sifre-yenile/${token}`;

      console.log(`[PASSWORD_RESET] E-posta: ${cleanEmail} -> Sıfırlama Linki: ${resetUrl}`);
      // İleride e-posta servisi bağlandığında: sendPasswordResetEmail(cleanEmail, resetUrl)
    }

    // Güvenlik gereği (kullanıcı e-posta tarama saldırılarını önlemek için) her durumda başarı mesajı dön
    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol ediniz.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, message: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
  }
}