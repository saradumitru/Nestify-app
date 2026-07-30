require('dotenv').config();

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const styles = [
  {
    name: 'Scandinavian',
    slug: 'scandinavian',
    kicker: 'Luminos, aerisit, funcțional și calm.',
    description:
      'Stilul scandinav valorizează lumina naturală, mobilierul simplu și o atmosferă caldă și relaxată.',
    history:
      'Stilul scandinav s-a dezvoltat în țările nordice în secolul XX și pune accent pe funcționalitate, simplitate și legătura cu natura.',
    period: 'Secolul XX și design contemporan.',
    audience: 'Persoane care iubesc spațiile curate, ordonate și luminoase.',
    materials: ['Lemn deschis', 'Bumbac', 'Lână', 'In', 'Ceramică'],
    colors: ['Alb', 'Crem', 'Gri deschis', 'Bej', 'Accente naturale'],
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
  },
  {
    name: 'Japandi',
    slug: 'japandi',
    kicker: 'Minimalism japonez combinat cu confort scandinav.',
    description:
      'Japandi aduce împreună spiritul wabi-sabi și funcționalitatea scandinavă, într-o estetică calmă și naturală.',
    history:
      'Acest stil hibrid a crescut în popularitate în ultimii ani, combinând eleganța japoneză cu abordarea simplă a nordicilor.',
    period: 'Secolul XXI.',
    audience: 'Cei care caută echilibru, calm și texturi naturale.',
    materials: ['Lemn natural', 'Bambus', 'Ceramică artizanală', 'In', 'Hârtie'],
    colors: ['Bej', 'Taupe', 'Gri cald', 'Verde salvie', 'Negru mat'],
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
  },
  {
    name: 'Boho',
    slug: 'boho',
    kicker: 'Eclectic, artistic și relaxat.',
    description:
      'Boho pune accent pe libertatea creativă, mixuri de texturi și o atmosferă caldă, feminină și personală.',
    history:
      'Inspirat din estetica boemă și interioarele nomade, boho este un stil flexibil și expresiv.',
    period: 'Secolul XXI.',
    audience: 'Persoanele creative care iubesc decorul eclectic și materialele naturale.',
    materials: ['Ratan', 'Macrame', 'Textile țesute', 'Ceramică', 'Lemn'],
    colors: ['Terracotta', 'Roz prăfuit', 'Crem', 'Verde olive', 'Maro cald'],
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  },
  {
    name: 'Art Deco',
    slug: 'art-deco',
    kicker: 'Luxos, geometric și sofisticat.',
    description:
      'Art Deco oferă un interior glam, cu texturi luxoase, forme grafice și un aer teatral de epocă.',
    history:
      'Acest stil a fost emblematic pentru perioada interbelică și continuă să inspire interioare elegante.',
    period: 'Anii 1920–1930 și reinterpretări moderne.',
    audience: 'Cei care doresc un design rafinat, teatral și distinct.',
    materials: ['Catifea', 'Marmură', 'Alamă', 'Sticlă fumurie', 'Lemn închis'],
    colors: ['Negru', 'Auriu', 'Burgundy', 'Crem', 'Bleumarin'],
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
  },
];

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nestify.app';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

await prisma.user.upsert({
  where: { email: adminEmail },
  update: {
    name: "Admin Nestify",
    password: hashedAdminPassword,
    role: "ADMIN",
  },
  create: {
    name: "Admin Nestify",
    email: adminEmail,
    password: hashedAdminPassword,
    role: "ADMIN",
  },
});

console.log(`Admin pregătit: ${adminEmail} / ${adminPassword}`);

  await prisma.favorite.deleteMany();
  await prisma.interiorImage.deleteMany();
  await prisma.style.deleteMany();
  await prisma.styleCategory.deleteMany();

  const category = await prisma.styleCategory.create({
    data: {
      name: 'Vintage Interiors',
      slug: 'vintage-interiors',
      description: 'O colecție de stiluri elegante, feminine și vintage.',
    },
  });

  for (const s of styles) {
    await prisma.style.create({
      data: {
        name: s.name,
        title: s.name,
        slug: s.slug,
        kicker: s.kicker,
        description: s.description,
        history: s.history,
        period: s.period,
        audience: s.audience,
        colors: s.colors,
        materials: s.materials,
        categoryId: category.id,
        imageUrl: s.imageUrl,
        images: {
          create: [
            {
              title: `${s.name} Living Room`,
              slug: `${s.slug}-living-room`,
              subtitle: 'Spațiu cald și feminin pentru relaxare',
              description: `${s.name} interpretat printr-o cameră armonioasă și echilibrată.`,
              imageUrl: s.imageUrl,
            },
            {
              title: `${s.name} Bedroom`,
              slug: `${s.slug}-bedroom`,
              subtitle: 'Dormitor delicat cu atmosferă vintage',
              description: `O cameră ce pune în valoare obiectele emblematice ale stilului ${s.name}.`,
              imageUrl: s.imageUrl,
            },
          ],
        },
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
