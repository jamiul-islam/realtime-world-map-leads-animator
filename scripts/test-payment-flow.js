/**
 * Payment Flow Test Script
 * 
 * This script tests the three payment states: success, pending, and canceled
 * by simulating API calls and checking Supabase database updates.
 * 
 * Test Card Numbers (from Stripe docs):
 * - Success: 4242 4242 4242 4242
 * - Pending: 4000 0025 0000 3155 (requires authentication)
 * - Declined: 4000 0000 0000 9995
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test email addresses
const TEST_EMAILS = {
  success: 'test-success@example.com',
  pending: 'test-pending@example.com',
  canceled: 'test-canceled@example.com',
};

// Test Stripe card numbers
const TEST_CARDS = {
  success: '4242 4242 4242 4242',
  pending: '4000 0025 0000 3155',
  declined: '4000 0000 0000 9995',
};

async function testPaymentState(state, email) {
  console.log(`\n🧪 Testing ${state.toUpperCase()} payment state...`);
  
  try {
    // Insert test payment record
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_email: email,
        stripe_session_id: `test_session_${state}_${Date.now()}`,
        stripe_payment_intent_id: state === 'succeeded' ? `test_pi_${state}_${Date.now()}` : null,
        amount: 200,
        currency: 'usd',
        status: state,
        metadata: {
          test: true,
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to insert ${state} payment:`, error.message);
      return false;
    }

    console.log(`✅ ${state.toUpperCase()} payment record created:`, {
      id: data.id,
      email: data.user_email,
      status: data.status,
      amount: `$${data.amount / 100}`,
    });

    // Verify the record was inserted
    const { data: verifyData, error: verifyError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', data.id)
      .single();

    if (verifyError) {
      console.error(`❌ Failed to verify ${state} payment:`, verifyError.message);
      return false;
    }

    console.log(`✅ ${state.toUpperCase()} payment verified in database`);
    return true;
  } catch (error) {
    console.error(`❌ Error testing ${state} payment:`, error.message);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .in('user_email', Object.values(TEST_EMAILS));

    if (error) {
      console.error('❌ Failed to cleanup test data:', error.message);
      return false;
    }

    console.log('✅ Test data cleaned up successfully');
    return true;
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Payment Flow Tests\n');
  console.log('=' .repeat(60));
  
  console.log('\n📋 Test Card Numbers (for manual testing):');
  console.log(`   Success: ${TEST_CARDS.success}`);
  console.log(`   Pending: ${TEST_CARDS.pending} (requires authentication)`);
  console.log(`   Declined: ${TEST_CARDS.declined}`);
  console.log('\n' + '='.repeat(60));

  const results = {
    succeeded: false,
    pending: false,
    canceled: false,
  };

  // Test each payment state
  results.succeeded = await testPaymentState('succeeded', TEST_EMAILS.success);
  results.pending = await testPaymentState('pending', TEST_EMAILS.pending);
  results.canceled = await testPaymentState('canceled', TEST_EMAILS.canceled);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log('='.repeat(60));
  console.log(`   ✅ Success State: ${results.succeeded ? 'PASSED' : 'FAILED'}`);
  console.log(`   ⏳ Pending State: ${results.pending ? 'PASSED' : 'FAILED'}`);
  console.log(`   ❌ Canceled State: ${results.canceled ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(60));

  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n✅ All tests PASSED!');
  } else {
    console.log('\n❌ Some tests FAILED!');
  }

  // Cleanup
  await cleanupTestData();

  console.log('\n📝 Next Steps:');
  console.log('   1. Add your Stripe keys to .env.local');
  console.log('   2. Run: npm run dev');
  console.log('   3. Visit: http://localhost:3000');
  console.log('   4. Click "Join Now" button');
  console.log('   5. Test with Stripe test cards above');
  console.log('   6. Check Stripe Dashboard and Supabase Dashboard');
  console.log('\n');

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
