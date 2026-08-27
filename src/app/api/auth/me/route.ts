import { NextResponse } from 'next/server';
import { getCustomerSession, getAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const customerSession = await getCustomerSession();
  if (customerSession) {
    const user = await prisma.user.findUnique({
      where: { id: customerSession.userId },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (user) {
      return NextResponse.json({ authenticated: true, user });
    }
  }

  const adminSession = await getAdminSession();
  if (adminSession) {
    return NextResponse.json({ authenticated: true, user: adminSession });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
