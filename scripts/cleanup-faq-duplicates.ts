import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up duplicate FAQs...');
  
  // Get all FAQs
  const allFaqs = await prisma.fAQ.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  console.log(`Total FAQs: ${allFaqs.length}`);
  
  // Group by question
  const grouped: Record<string, typeof allFaqs> = {};
  for (const faq of allFaqs) {
    if (!grouped[faq.question]) {
      grouped[faq.question] = [];
    }
    grouped[faq.question].push(faq);
  }
  
  // Delete duplicates (keep the newest one)
  let deleted = 0;
  for (const [question, faqs] of Object.entries(grouped)) {
    if (faqs.length > 1) {
      console.log(`Found ${faqs.length} duplicates for: "${question}"`);
      // Keep the first (newest), delete the rest
      const toDelete = faqs.slice(1);
      for (const faq of toDelete) {
        await prisma.fAQ.delete({ where: { id: faq.id } });
        deleted++;
        console.log(`  Deleted: ${faq.id} (created: ${faq.createdAt})`);
      }
    }
  }
  
  console.log(`\nDeleted ${deleted} duplicate FAQs`);
  
  // Verify
  const remaining = await prisma.fAQ.findMany();
  console.log(`Remaining FAQs: ${remaining.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
