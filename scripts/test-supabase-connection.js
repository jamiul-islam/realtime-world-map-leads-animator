#!/usr/bin/env node

/**
 * Test script to verify Supabase connection and service role key
 * Run with: node scripts/test-supabase-connection.js
 */

const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connection...\n');

  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;

  console.log('Environment Variables:');
  console.log('  URL:', url ? '✅ Set' : '❌ Missing');
  console.log('  Anon Key:', anonKey ? `✅ Set (${anonKey.substring(0, 20)}...)` : '❌ Missing');
  console.log('  Service Role Key:', serviceRoleKey ? `✅ Set (${serviceRoleKey.substring(0, 20)}...)` : '❌ Missing');
  console.log('');

  if (!url || !serviceRoleKey) {
    console.error('❌ Missing required environment variables!');
    process.exit(1);
  }

  // Create service role client
  const supabase = createClient(url, serviceRoleKey);

  try {
    // Test 1: Fetch country states
    console.log('Test 1: Fetching country_states table...');
    const { data: countries, error: countriesError } = await supabase
      .from('country_states')
      .select('country_code, activation_count, glow_band')
      .limit(5);

    if (countriesError) {
      console.error('❌ Error fetching countries:', countriesError.message);
    } else {
      console.log(`✅ Successfully fetched ${countries.length} countries`);
      console.log('Sample data:', countries);
    }
    console.log('');

    // Test 2: Fetch Australia specifically
    console.log('Test 2: Fetching Australia (AU)...');
    const { data: au, error: auError } = await supabase
      .from('country_states')
      .select('*')
      .eq('country_code', 'AU');

    if (auError) {
      console.error('❌ Error fetching AU:', auError.message);
    } else if (!au || au.length === 0) {
      console.error('❌ Australia not found in database!');
    } else {
      console.log('✅ Australia found:', au[0]);
    }
    console.log('');

    // Test 3: Test UPDATE with SELECT
    console.log('Test 3: Testing UPDATE with SELECT...');
    const testCountry = au && au.length > 0 ? au[0] : null;
    
    if (testCountry) {
      const { data: updateResult, error: updateError } = await supabase
        .from('country_states')
        .update({
          last_updated: new Date().toISOString(),
        })
        .eq('country_code', 'AU')
        .select();

      if (updateError) {
        console.error('❌ Error updating AU:', updateError);
        console.error('   Message:', updateError.message);
        console.error('   Code:', updateError.code);
        console.error('   Details:', updateError.details);
        console.error('   Hint:', updateError.hint);
      } else if (!updateResult || updateResult.length === 0) {
        console.error('❌ Update succeeded but no data returned!');
        console.error('   This indicates an RLS policy issue.');
      } else {
        console.log('✅ Update successful with data returned:', updateResult[0]);
      }
    }
    console.log('');

    // Test 4: Check locker state
    console.log('Test 4: Fetching locker_state...');
    const { data: locker, error: lockerError } = await supabase
      .from('locker_state')
      .select('*')
      .eq('id', 1);

    if (lockerError) {
      console.error('❌ Error fetching locker:', lockerError.message);
    } else if (!locker || locker.length === 0) {
      console.error('❌ Locker state not found!');
    } else {
      console.log('✅ Locker state found:', locker[0]);
    }
    console.log('');

    console.log('✅ Connection test complete!\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

testConnection();
