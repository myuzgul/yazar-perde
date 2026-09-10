import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/notification-service';

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

      const host = req.headers.get('host') || 'yazarperde.com';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const resetUrl = `${protocol}://${host}/sifre-yenile/${token}`;

      console.log(`[PASSWORD_RESET] E-posta: ${cleanEmail} -> Sıfırlama Linki: ${resetUrl}`);

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #0f172a; margin-top: 0;">Şifre Sıfırlama Talebi</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Sayın <strong>${user.name} ${user.surname}</strong>,<br><br>
            Yazar Perde hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background: #1B84F8; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">
              Yeni Şifre Belirle ↗
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
            Bu bağlantı 1 saat boyunca geçerlidir. Talebi siz yapmadıysanız bu e-postayı güvenle dikkate almayabilirsiniz.
          </p>
        </div>
      `;

      sendEmail(cleanEmail, 'Şifre Sıfırlama Bağlantısı - Yazar Perde', htmlBody).catch(console.error);
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