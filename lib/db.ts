// Database helper that tolerates missing Prisma client (offline/local-only scenarios)
type PrismaClientLike = {
  $queryRaw: <T = unknown>(...args: any[]) => Promise<T>;
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientLike | null };

async function loadPrismaClient(): Promise<PrismaClientLike | null> {
  if (!process.env.DATABASE_URL) return null;

  if (globalForPrisma.prisma !== undefined) return globalForPrisma.prisma;

  try {
    const prismaModule: any = await import('@prisma/client').catch((error) => {
      console.warn('Prisma client not available; running in offline mode.', error);
      return {};
    });

    const PrismaClient = prismaModule?.PrismaClient as { new (): PrismaClientLike } | undefined;

    if (!PrismaClient) {
      globalForPrisma.prisma = null;
      return null;
    }

    const prisma = new PrismaClient();
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
    return prisma;
  } catch (error) {
    console.warn('Failed to initialize Prisma; running offline.', error);
    globalForPrisma.prisma = null;
    return null;
  }
}

export async function getPrismaClient() {
  return loadPrismaClient();
}

export async function isDatabaseAvailable() {
  const prisma = await loadPrismaClient();
  if (!prisma) return false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    console.error('Database unavailable', err);
    return false;
  }
}
