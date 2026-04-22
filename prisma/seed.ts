import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          username: 'admin',
          displayName: 'Administrator',
        },
      },
    },
    include: { profile: true },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          username: 'demo',
          displayName: 'Demo User',
        },
      },
    },
    include: { profile: true },
  });

  // eslint-disable-next-line no-console
  console.log({ admin, user });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
