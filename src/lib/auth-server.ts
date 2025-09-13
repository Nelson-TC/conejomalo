import { cookies } from 'next/headers';
import { prisma } from './prisma';

const USER_COOKIE = 'auth_user_id';

export async function getCurrentUser() {
  try {
    const id = cookies().get(USER_COOKIE)?.value;
    if (!id) return null;
  // @ts-ignore (temporal si TS no refrescó tipos de Prisma)
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true } });
    return user;
  } catch { return null; }
}

export function requireUser() {
  return getCurrentUser().then(u => { if (!u) throw new Error('UNAUTHENTICATED'); return u; });
}