#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const prisma = new PrismaClient();

async function createAdmin(email, password, name) {
  try {
    console.log('🔧 Creating admin user...');

    // Проверяем, существует ли уже пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return false;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем администратора
    const admin = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 User details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.createdAt}`);
    console.log('');
    console.log('🔐 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('⚠️  Remember to change the password after first login!');

    return true;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    return false;
  }
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('email', {
      alias: 'e',
      type: 'string',
      description: 'Admin email address',
      demandOption: true,
    })
    .option('password', {
      alias: 'p',
      type: 'string',
      description: 'Admin password (minimum 8 characters)',
      demandOption: true,
    })
    .option('name', {
      alias: 'n',
      type: 'string',
      description: 'Admin display name',
    })
    .option('interactive', {
      alias: 'i',
      type: 'boolean',
      description: 'Interactive mode (prompt for credentials)',
      default: false,
    })
    .help()
    .alias('help', 'h')
    .argv;

  let email = argv.email;
  let password = argv.password;
  let name = argv.name;

  // Интерактивный режим
  if (argv.interactive) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    if (!email) {
      email = await question('Enter admin email: ');
    }
    if (!password) {
      password = await question('Enter admin password: ');
    }
    if (!name) {
      name = await question('Enter admin name (optional): ');
    }

    rl.close();
  }

  // Валидация
  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    process.exit(1);
  }

  // Создаем администратора
  const success = await createAdmin(email, password, name);

  if (success) {
    console.log('');
    console.log('🎉 Admin user creation completed successfully!');
  } else {
    console.log('');
    console.log('💥 Admin user creation failed!');
    process.exit(1);
  }
}

// Обработка ошибок
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n👋 Goodbye!');
  await prisma.$disconnect();
  process.exit(0);
});

// Запуск скрипта
main()
  .catch((error) => {
    console.error('❌ Script error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
