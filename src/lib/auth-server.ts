import { prisma } from './prisma';
import { getSession } from './auth';

/**
 * Obtiene el usuario autenticado basándose en el JWT (cookie 'session').
 * Si el token es inválido o el usuario ya no existe, retorna null.
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return null;
    const id = session.sub;
    if (!id) return null;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true }
    });
    return user;
  } catch (e) {
    return null;
  }
}

export function requireUser() {
  return getCurrentUser().then(u => { if (!u) throw new Error('UNAUTHENTICATED'); return u; });
}