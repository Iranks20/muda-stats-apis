const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up MUDA Pay Health Monitoring API...\n');

// Step 1: Check if .env exists, if not create it
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created successfully');
} else {
  console.log('✅ .env file already exists');
}

// Step 2: Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 3: Check if MySQL is running
console.log('\n🗄️ Checking MySQL connection...');
try {
  execSync('mysql -u root -e "SELECT 1"', { stdio: 'pipe' });
  console.log('✅ MySQL is running and accessible');
} catch (error) {
  console.log('⚠️ MySQL connection failed. Please ensure MySQL is running.');
  console.log('   You can start MySQL with: sudo service mysql start');
}

// Step 4: Create database if it doesn't exist
console.log('\n🗄️ Setting up database...');
try {
  execSync('mysql -u root -e "CREATE DATABASE IF NOT EXISTS muda_pay_health"', { stdio: 'pipe' });
  console.log('✅ Database created successfully');
} catch (error) {
  console.log('⚠️ Could not create database. Please create it manually:');
  console.log('   mysql -u root -e "CREATE DATABASE muda_pay_health"');
}

// Step 5: Run schema
console.log('\n📋 Running database schema...');
try {
  execSync('mysql -u root muda_pay_health < database/schema.sql', { stdio: 'pipe' });
  console.log('✅ Database schema applied successfully');
} catch (error) {
  console.log('⚠️ Could not apply schema. Please run manually:');
  console.log('   mysql -u root muda_pay_health < database/schema.sql');
}

console.log('\n🎉 Setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Start the API: npm run dev');
console.log('2. Test the API: node test-api.js');
console.log('3. Check logs in the logs/ directory');
console.log('\n🔗 API will be available at: http://localhost:3001');
console.log('📊 Health monitoring will start automatically'); 