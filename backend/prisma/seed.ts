import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Mulai seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bpn.go.id' },
    update: {},
    create: { name: 'Soekarno, S.Kom.', email: 'admin@bpn.go.id', password: hashedPassword, role: 'admin' },
  });

  const staff1 = await prisma.user.upsert({
    where: { email: 'hidayat@bpn.go.id' },
    update: {},
    create: { name: 'A. Hidayat', email: 'hidayat@bpn.go.id', password: hashedPassword, role: 'staff' },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'rahayu@bpn.go.id' },
    update: {},
    create: { name: 'S. Rahayu', email: 'rahayu@bpn.go.id', password: hashedPassword, role: 'staff' },
  });

  const staff3 = await prisma.user.upsert({
    where: { email: 'pratama@bpn.go.id' },
    update: {},
    create: { name: 'R. Pratama', email: 'pratama@bpn.go.id', password: hashedPassword, role: 'staff' },
  });

  console.log('4 users dibuat.');

  // Dokumen Sengketa
  const sengketaDocs = [
    { noBerkas: 'ADM/2025/PBG/045', judul: 'Sengketa Batas Lahan Padamara', lokasi: 'Kec. Padamara', tipe: 'sengketa', status: 'proses', klasifikasi: 'rahasia', keamanan: 'internal', authorId: admin.id },
    { noBerkas: 'ADM/2025/PBG/044', judul: 'Sengketa Tumpang Tindih Sertifikat HM', lokasi: 'Kec. Mrebet', tipe: 'sengketa', status: 'proses', klasifikasi: 'terbuka', keamanan: 'internal', authorId: staff1.id },
    { noBerkas: 'ADM/2025/PBG/042', judul: 'Sengketa Warisan Tanah Bobotsari', lokasi: 'Kec. Bobotsari', tipe: 'sengketa', status: 'selesai', klasifikasi: 'terbuka', keamanan: 'publik', authorId: staff2.id },
    { noBerkas: 'ADM/2025/PBG/041', judul: 'Sengketa Batas Persil Desa Kutasari', lokasi: 'Kec. Kutasari', tipe: 'sengketa', status: 'selesai', klasifikasi: 'terbuka', keamanan: 'publik', authorId: staff1.id },
    { noBerkas: 'ADM/2025/PBG/039', judul: 'Sengketa Tumpang Tindih Sertifikat', lokasi: 'Kec. Kaligondang', tipe: 'sengketa', status: 'error', klasifikasi: 'sangat_rahasia', keamanan: 'internal', authorId: admin.id },
    { noBerkas: 'ADM/2025/PBG/038', judul: 'Sengketa Tanah Wakaf Desa Bojongsari', lokasi: 'Kec. Bojongsari', tipe: 'sengketa', status: 'proses', klasifikasi: 'rahasia', keamanan: 'internal', authorId: staff3.id },
    { noBerkas: 'ADM/2025/PBG/036', judul: 'Sengketa Tanah Adat Karangreja', lokasi: 'Kec. Karangreja', tipe: 'sengketa', status: 'selesai', klasifikasi: 'terbuka', keamanan: 'publik', authorId: staff2.id },
    { noBerkas: 'ADM/2025/PBG/035', judul: 'Sengketa HGB Expired Purbalingga Lor', lokasi: 'Kec. Purbalingga', tipe: 'sengketa', status: 'proses', klasifikasi: 'rahasia', keamanan: 'internal', authorId: admin.id },
    { noBerkas: 'ADM/2025/PBG/033', judul: 'Sengketa Penjualan Ganda Tanah Rembang', lokasi: 'Kec. Rembang', tipe: 'sengketa', status: 'selesai', klasifikasi: 'terbuka', keamanan: 'publik', authorId: staff1.id },
    { noBerkas: 'ADM/2025/PBG/030', judul: 'Sengketa Batas Tanah Kalimanah', lokasi: 'Kec. Kalimanah', tipe: 'sengketa', status: 'proses', klasifikasi: 'terbuka', keamanan: 'internal', authorId: staff3.id },
  ];

  // Dokumen Perkara
  const perkaraDocs = [
    { noBerkas: 'PRK/2025/PBG/012', judul: 'Perkara Perdata Tanah Kertanegara', lokasi: 'Kec. Kertanegara', tipe: 'perkara', status: 'proses', klasifikasi: 'rahasia', keamanan: 'internal', authorId: admin.id },
    { noBerkas: 'PRK/2025/PBG/011', judul: 'Perkara Gugatan Hak Milik Bukateja', lokasi: 'Kec. Bukateja', tipe: 'perkara', status: 'selesai', klasifikasi: 'terbuka', keamanan: 'publik', authorId: staff2.id },
    { noBerkas: 'PRK/2025/PBG/010', judul: 'Perkara TUN Pembatalan Sertifikat', lokasi: 'Kec. Purbalingga', tipe: 'perkara', status: 'proses', klasifikasi: 'sangat_rahasia', keamanan: 'internal', authorId: staff1.id },
    { noBerkas: 'PRK/2025/PBG/009', judul: 'Perkara Sita Jaminan Tanah Kemangkon', lokasi: 'Kec. Kemangkon', tipe: 'perkara', status: 'selesai', klasifikasi: 'rahasia', keamanan: 'internal', authorId: admin.id },
    { noBerkas: 'PRK/2025/PBG/008', judul: 'Perkara Kasasi Hak Guna Usaha', lokasi: 'Kec. Karangmoncol', tipe: 'perkara', status: 'proses', klasifikasi: 'terbuka', keamanan: 'publik', authorId: staff3.id },
    { noBerkas: 'PRK/2025/PBG/007', judul: 'Perkara Perdata Warisan Tanah Kejobong', lokasi: 'Kec. Kejobong', tipe: 'perkara', status: 'error', klasifikasi: 'rahasia', keamanan: 'internal', authorId: staff2.id },
    { noBerkas: 'PRK/2025/PBG/006', judul: 'Perkara Banding Sertifikat HM Pengadilan', lokasi: 'Kec. Bobotsari', tipe: 'perkara', status: 'selesai', klasifikasi: 'terbuka', keamanan: 'publik', authorId: staff1.id },
    { noBerkas: 'PRK/2025/PBG/005', judul: 'Perkara TUN Izin Lokasi PT Agrindo', lokasi: 'Kec. Karanganyar', tipe: 'perkara', status: 'proses', klasifikasi: 'sangat_rahasia', keamanan: 'internal', authorId: admin.id },
  ];

  const allDocs = [...sengketaDocs, ...perkaraDocs];

  for (const doc of allDocs) {
    await prisma.document.upsert({
      where: { noBerkas: doc.noBerkas },
      update: {},
      create: doc,
    });
  }

  console.log(`${allDocs.length} dokumen sample dibuat.`);
  console.log('Seeding selesai!');
  console.log('---');
  console.log('Login: admin@bpn.go.id / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
