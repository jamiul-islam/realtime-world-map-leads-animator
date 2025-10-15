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
    // Create Supabase client with cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
    } = await supabase.auth.getUser();

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

    // Parse request body
    const body: CountryUpdate = await request.json();
    const { countryCode, mode, value, note } = body;

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

    // Get current country state
    const { data: currentState, error: fetchError } = await supabase
      .from('country_states')
      .select('*')
      .eq('country_code', countryCode)
      .single();

    if (fetchError) {
      console.error('Error fetching country state:', {
        admin: user.email,
        countryCode,
        error: fetchError.message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    // Calculate new activation count
    const newActivationCount =
      mode === 'increment'
        ? currentState.activation_count + value
        : value;

    // Calculate new glow band
    const newGlowBand = calculateGlowBand(newActivationCount);

    // Update country state
    const { data: updatedState, error: updateError } = await supabase
      .from('country_states')
      .update({
        activation_count: newActivationCount,
        glow_band: newGlowBand,
        last_updated: new Date().toISOString(),
      })
      .eq('country_code', countryCode)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating country:', {
        admin: user.email,
        countryCode,
        mode,
        value,
        error: updateError.message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Failed to update country' },
        { status: 500 }
      );
    }

    // Insert audit log entry
    const actionType = mode === 'increment' ? 'country_increment' : 'country_set';
    const deltaOrValue = mode === 'increment' ? `+${value}` : `set to ${value}`;

    const { error: auditError } = await supabase.from('audit_log').insert({
      admin_email: user.email!,
      action_type: actionType,
      subject: countryCode,
      delta_or_value: deltaOrValue,
      note: note || null,
    });

    if (auditError) {
      console.error('Error creating audit log:', {
        admin: user.email,
        action: actionType,
        subject: countryCode,
        error: auditError.message,
        timestamp: new Date().toISOString(),
      });
      // Don't fail the request if audit log fails
    }

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
