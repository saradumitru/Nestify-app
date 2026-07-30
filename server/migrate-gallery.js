require('dotenv').config();
const prisma = require('./src/config/prisma');

async function main() {
  const styles = await prisma.style.findMany({
    select: { id: true, title: true, gallery: true },
  });

  let migrated = 0;
  for (const style of styles) {
    if (!Array.isArray(style.gallery) || style.gallery.length === 0) continue;

    console.log(`Migrating "${style.title}" — ${style.gallery.length} photos`);

    for (const imageUrl of style.gallery) {
      // Check if already migrated
      const existing = await prisma.styleGalleryPhoto.findFirst({
        where: { styleId: style.id, imageUrl },
      });
      if (!existing) {
        await prisma.styleGalleryPhoto.create({
          data: { styleId: style.id, imageUrl },
        });
        migrated++;
      }
    }

    // Clear the old JSON gallery after migration
    await prisma.style.update({
      where: { id: style.id },
      data: { gallery: [] },
    });
  }

  console.log(`Done. Migrated ${migrated} photos.`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
