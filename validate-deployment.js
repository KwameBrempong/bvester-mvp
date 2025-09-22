#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Validates that Priority 1 implementations are ready for deployment
 */

import fs from 'fs';
import path from 'path';

const REQUIRED_FILES = [
  'amplify/data/resource.ts',
  'src/services/dataService.ts',
  'src/config/environment.ts',
  'deployment.zip',
  '.env',
];

const REQUIRED_ENV_VARS = [
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_STRIPE_API_BASE_URL',
];

function validateFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required file: ${filePath}`);
    return false;
  }
  console.log(`✅ Found: ${filePath}`);
  return true;
}

function validateEnvironmentVariables() {
  console.log('\n🔍 Checking environment variables...');

  const envPath = '.env';
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const missingVars = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!envContent.includes(envVar)) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  console.log('✅ All required environment variables found');
  return true;
}

function validateDatabaseSchema() {
  console.log('\n🗄️ Validating database schema...');

  const schemaPath = 'amplify/data/resource.ts';
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  const requiredModels = [
    'UserProfile',
    'Transaction',
    'BusinessAssessment',
    'UserSubscription',
    'AcceleratorProgress',
    'PaymentEvent',
    'SystemConfig'
  ];

  const missingModels = [];
  for (const model of requiredModels) {
    if (!schemaContent.includes(model)) {
      missingModels.push(model);
    }
  }

  if (missingModels.length > 0) {
    console.error(`❌ Missing database models: ${missingModels.join(', ')}`);
    return false;
  }

  console.log('✅ All required database models found');
  return true;
}

function validateStripeConfiguration() {
  console.log('\n💳 Validating Stripe configuration...');

  const stripeServicePath = 'src/stripeService.ts';
  const stripeContent = fs.readFileSync(stripeServicePath, 'utf8');

  // Check for hardcoded secrets (should not exist)
  const secretPatterns = [
    /sk_test_[\w]+/,
    /sk_live_[\w]+/,
    /whsec_[\w]+/
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test(stripeContent)) {
      console.error('❌ Found hardcoded Stripe secret in source code');
      return false;
    }
  }

  // Check for environment configuration import
  if (!stripeContent.includes('environment.stripe')) {
    console.error('❌ Stripe service not using environment configuration');
    return false;
  }

  console.log('✅ Stripe configuration is secure');
  return true;
}

function validateLambdaPackage() {
  console.log('\n⚡ Validating Lambda deployment package...');

  if (!fs.existsSync('deployment.zip')) {
    console.error('❌ Lambda deployment package not found');
    return false;
  }

  const stats = fs.statSync('deployment.zip');
  const fileSizeMB = stats.size / (1024 * 1024);

  if (fileSizeMB > 50) {
    console.warn(`⚠️ Lambda package is large: ${fileSizeMB.toFixed(2)}MB`);
  }

  console.log(`✅ Lambda package ready: ${fileSizeMB.toFixed(2)}MB`);
  return true;
}

function main() {
  console.log('🚀 Bvester Priority 1 Deployment Validation\n');

  let allChecksPass = true;

  // File existence checks
  console.log('📁 Checking required files...');
  for (const file of REQUIRED_FILES) {
    if (!validateFileExists(file)) {
      allChecksPass = false;
    }
  }

  // Environment variables
  if (!validateEnvironmentVariables()) {
    allChecksPass = false;
  }

  // Database schema
  if (!validateDatabaseSchema()) {
    allChecksPass = false;
  }

  // Stripe configuration
  if (!validateStripeConfiguration()) {
    allChecksPass = false;
  }

  // Lambda package
  if (!validateLambdaPackage()) {
    allChecksPass = false;
  }

  console.log('\n' + '='.repeat(50));

  if (allChecksPass) {
    console.log('🎉 All validation checks passed!');
    console.log('✅ Priority 1 implementations are ready for deployment');
    console.log('\nNext steps:');
    console.log('1. Deploy database schema: npx amplify push');
    console.log('2. Upload deployment.zip to AWS Lambda');
    console.log('3. Set Lambda environment variables');
    console.log('4. Test end-to-end functionality');
    process.exit(0);
  } else {
    console.log('❌ Some validation checks failed');
    console.log('Please address the issues above before deploying');
    process.exit(1);
  }
}

main();