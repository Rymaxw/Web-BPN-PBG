import prisma from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const adminEmail = 'admin@bpn.go.id';
  
  // Check if admin exists
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin user already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin BPN',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('Admin user created successfully:');
  console.log('Email: admin@bpn.go.id');
  console.log('Password: password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
