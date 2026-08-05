import prisma from './src/lib/prisma';

async function main() {
  console.log('Clearing dummy data...');
  await prisma.document.deleteMany({});
  console.log('All documents deleted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Prisma V7 might handle disconnects differently, but usually this is fine
  });
