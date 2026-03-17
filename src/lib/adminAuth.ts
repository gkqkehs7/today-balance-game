import { NextRequest } from 'next/server';

export function checkAdminAuth(req: NextRequest): boolean {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET;
}
