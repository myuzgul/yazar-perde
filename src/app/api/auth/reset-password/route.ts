import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, password, passwordConfirm } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, message: 'Geçersiz istek.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Şifreniz en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    if (passwordConfirm && password !== passwordConfirm) {
      return NextResponse.json({ success: false, message: 'Şifreler birbiriyle eşleşmiyor.' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json({ success: false, message: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı.' }, { status: 400 });
    }

    if (resetToken.usedAt) {
      return NextResponse.json({ success: false, message: 'Bu sıfırlama bağlantısı daha önce kullanılmış.' }, { status: 400 });
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ success: false, message: 'Bu bağlantının geçerlilik süresi (1 saat) dolmuştur. Lütfen tekrar talep ediniz.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Şifreyi güncelle ve token'ı kullanıldı olarak işaretle
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla yenilendi! Şimdi yeni şifrenizle giriş yapabilirsiniz.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Şifre sıfırlanırken bir hata oluştu.' }, { status: 500 });
  }
}