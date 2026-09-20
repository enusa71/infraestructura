import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ rol: 'custodia_usuario' });
  }

  try {
    const usuarioRol = await prisma.usuarioRol.findUnique({
      where: { userEmail: session.user.email },
    });

    return Response.json({
      email: session.user.email,
      rol: usuarioRol?.rol || 'custodia_usuario',
      roles: [usuarioRol?.rol || 'custodia_usuario'],
    });
  } catch (error) {
    console.error('Error obteniendo rol:', error);
    return Response.json({ rol: 'custodia_usuario' }, { status: 500 });
  }
}
