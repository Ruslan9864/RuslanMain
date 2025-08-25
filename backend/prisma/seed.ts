import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminEmail = 'rrustamov986@gmail.com';
  const adminPassword = 'Rrustamov9864';
  const adminName = 'Rustam Rustamov';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', adminEmail);
  } else {
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Admin user created:', admin.email);
  }

  // Create default categories
  const defaultCategories = [
    {
      name: 'Брендинг',
      slug: 'branding',
      description: 'Статьи о брендинге и дизайне',
      icon: '🎨',
    },
    {
      name: 'Маркетинг',
      slug: 'marketing',
      description: 'Маркетинговые стратегии и кейсы',
      icon: '📈',
    },
    {
      name: 'Дизайн',
      slug: 'design',
      description: 'Дизайн и UX/UI',
      icon: '💡',
    },
    {
      name: 'Кейсы',
      slug: 'cases',
      description: 'Портфолио и кейсы проектов',
      icon: '📋',
    },
  ];

  for (const categoryData of defaultCategories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: categoryData,
      });
      console.log('✅ Category created:', categoryData.name);
    } else {
      console.log('✅ Category already exists:', categoryData.name);
    }
  }

  // Create default tags
  const defaultTags = [
    { name: 'Брендинг', slug: 'branding' },
    { name: 'Логотип', slug: 'logo' },
    { name: 'Дизайн', slug: 'design' },
    { name: 'Маркетинг', slug: 'marketing' },
    { name: 'Стратегия', slug: 'strategy' },
    { name: 'Кейс', slug: 'case' },
    { name: 'UX/UI', slug: 'ux-ui' },
    { name: 'Веб-дизайн', slug: 'web-design' },
  ];

  for (const tagData of defaultTags) {
    const existingTag = await prisma.tag.findUnique({
      where: { slug: tagData.slug },
    });

    if (!existingTag) {
      await prisma.tag.create({
        data: tagData,
      });
      console.log('✅ Tag created:', tagData.name);
    } else {
      console.log('✅ Tag already exists:', tagData.name);
    }
  }

  // Create sample post
  const samplePost = await prisma.post.findFirst({
    where: { slug: 'welcome-to-blog' },
  });

  if (!samplePost) {
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (admin) {
      const post = await prisma.post.create({
        data: {
          title: 'Добро пожаловать в блог',
          slug: 'welcome-to-blog',
          status: 'PUBLISHED',
          language: 'RU',
          summary: 'Первая статья в нашем блоге о брендинге и дизайне',
          content: `
# Добро пожаловать в блог!

Это первая статья в нашем блоге, посвященном брендингу, дизайну и маркетингу.

## Что вы найдете здесь

- Кейсы проектов
- Советы по брендингу
- Анализ трендов дизайна
- Маркетинговые стратегии

## О нас

Мы специализируемся на создании эффективных брендов и дизайн-решений для бизнеса.

---

*Создано с помощью Admin Panel*
          `,
          authorId: admin.id,
          publishedAt: new Date(),
          seoMetaTitle: 'Добро пожаловать в блог - Брендинг и дизайн',
          seoMetaDescription: 'Первая статья в блоге о брендинге, дизайне и маркетинге. Кейсы, советы и тренды.',
          ogTitle: 'Добро пожаловать в блог',
          ogDescription: 'Первая статья в нашем блоге о брендинге и дизайне',
        },
      });

      // Add to default category
      const brandingCategory = await prisma.category.findUnique({
        where: { slug: 'branding' },
      });

      if (brandingCategory) {
        await prisma.postCategory.create({
          data: {
            postId: post.id,
            categoryId: brandingCategory.id,
          },
        });
      }

      // Add default tags
      const defaultPostTags = ['branding', 'design'];
      for (const tagSlug of defaultPostTags) {
        const tag = await prisma.tag.findUnique({
          where: { slug: tagSlug },
        });

        if (tag) {
          await prisma.postTag.create({
            data: {
              postId: post.id,
              tagId: tag.id,
            },
          });
        }
      }

      console.log('✅ Sample post created: Welcome to blog');
    }
  } else {
    console.log('✅ Sample post already exists');
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
