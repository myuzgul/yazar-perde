import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, CUSTOMER_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Çıkış yapıldı.' });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  response.cookies.delete(CUSTOMER_COOKIE_NAME);
  return response;
}
