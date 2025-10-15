import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CountryUpdate } from '@/types';

// Calculate glow band based on activation count
function calculateGlowBand(activationCount: number): number {
  if (activationCount === 0) return 0;
  if (activationCount <= 2) return 1;
  if (activationCount <= 5) return 2;
  return 3; // activationCount >= 6
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with cookies for authentication
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const userRole = user.app_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Create service role client for admin operations (bypasses RLS)
    // Use direct createClient instead of createServerClient for service role
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!
    );

    // Parse request body
    const body: CountryUpdate = await request.json();
    const { countryCode, mode, value, note } = body;

    console.log('🔍 [UPDATE-COUNTRY] Request received:', {
      admin: user.email,
      countryCode,
      mode,
      value,
      note: note || 'none',
      timestamp: new Date().toISOString(),
    });

    // Validate input
    if (!countryCode || !mode || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (mode === 'increment' && value <= 0) {
      return NextResponse.json(
        { success: false, error: 'Increment value must be positive' },
        { status: 400 }
      );
    }

    if (mode === 'absolute' && value < 0) {
      return NextResponse.json(
        { success: false, error: 'Absolute value must be non-negative' },
        { status: 400 }
      );
    }

    // Get current country state using admin client
    console.log('🔍 [UPDATE-COUNTRY] Fetching current state for:', countryCode);
    
    const { data: currentStateData, error: fetchError } = await supabaseAdmin
      .from('country_states')
      .select('*')
      .eq('country_code', countryCode);

    console.log('🔍 [UPDATE-COUNTRY] Fetch result:', {
      dataLength: currentStateData?.length || 0,
      hasError: !!fetchError,
      errorMessage: fetchError?.message || 'none',
      data: currentStateData,
    });

    if (fetchError) {
      console.error('❌ [UPDATE-COUNTRY] Error fetching country state:', {
        admin: user.email,
        countryCode,
        error: fetchError.message,
        errorDetails: fetchError,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch country state' },
        { status: 500 }
      );
    }

    if (!currentStateData || currentStateData.length === 0) {
      console.error('❌ [UPDATE-COUNTRY] Country not found:', {
        admin: user.email,
        countryCode,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    const currentState = currentStateData[0];
    console.log('✅ [UPDATE-COUNTRY] Current state:', currentState);

    // Calculate new activation count
    const newActivationCount =
      mode === 'increment'
        ? currentState.activation_count + value
        : value;

    // Calculate new glow band
    const newGlowBand = calculateGlowBand(newActivationCount);

    console.log('🔍 [UPDATE-COUNTRY] Calculated values:', {
      currentActivationCount: currentState.activation_count,
      currentGlowBand: currentState.glow_band,
      newActivationCount,
      newGlowBand,
      mode,
      value,
    });

    // Check if service role key is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE) {
      console.error('❌ [UPDATE-COUNTRY] CRITICAL: Service role key not configured!');
      return NextResponse.json(
        { success: false, error: 'Server configuration error - service role key missing' },
        { status: 500 }
      );
    }

    console.log('🔍 [UPDATE-COUNTRY] Attempting update with service role...');

    // Update country state using admin client
    const { data: updatedStateData, error: updateError } = await supabaseAdmin
      .from('country_states')
      .update({
        activation_count: newActivationCount,
        glow_band: newGlowBand,
        last_updated: new Date().toISOString(),
      })
      .eq('country_code', countryCode)
      .select();

    console.log('🔍 [UPDATE-COUNTRY] Update result:', {
      dataLength: updatedStateData?.length || 0,
      hasError: !!updateError,
      errorMessage: updateError?.message || 'none',
      errorDetails: updateError,
      data: updatedStateData,
    });

    if (updateError) {
      console.error('❌ [UPDATE-COUNTRY] Error updating country:', {
        admin: user.email,
        countryCode,
        mode,
        value,
        error: updateError.message,
        errorCode: updateError.code,
        errorDetails: updateError.details,
        errorHint: updateError.hint,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: `Failed to update country: ${updateError.message}` },
        { status: 500 }
      );
    }

    if (!updatedStateData || updatedStateData.length === 0) {
      console.error('❌ [UPDATE-COUNTRY] No data returned after update:', {
        admin: user.email,
        countryCode,
        updateErrorWasNull: updateError === null,
        dataWasNull: updatedStateData === null,
        dataWasEmpty: updatedStateData?.length === 0,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Update failed - no data returned (possible RLS issue)' },
        { status: 500 }
      );
    }

    const updatedState = updatedStateData[0];
    console.log('✅ [UPDATE-COUNTRY] Update successful:', updatedState);

    // Insert audit log entry using admin client
    const actionType = mode === 'increment' ? 'country_increment' : 'country_set';
    const deltaOrValue = mode === 'increment' ? `+${value}` : `set to ${value}`;

    console.log('🔍 [UPDATE-COUNTRY] Creating audit log entry...');

    const { error: auditError } = await supabaseAdmin.from('audit_log').insert({
      admin_email: user.email!,
      action_type: actionType,
      subject: countryCode,
      delta_or_value: deltaOrValue,
      note: note || null,
    });

    if (auditError) {
      console.error('⚠️ [UPDATE-COUNTRY] Error creating audit log:', {
        admin: user.email,
        action: actionType,
        subject: countryCode,
        error: auditError.message,
        timestamp: new Date().toISOString(),
      });
      // Don't fail the request if audit log fails
    } else {
      console.log('✅ [UPDATE-COUNTRY] Audit log created successfully');
    }

    console.log('✅ [UPDATE-COUNTRY] Request completed successfully');

    return NextResponse.json({
      success: true,
      data: updatedState,
    });
  } catch (error) {
    console.error('Error in update-country route:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
