import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { EnergyUpdate } from '@/types';

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
    const body: EnergyUpdate = await request.json();
    const { mode, value, note } = body;

    // Validate input
    if (!mode || value === undefined) {
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

    if (mode === 'absolute' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { success: false, error: 'Absolute value must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Get current locker state using admin client
    const { data: currentStateData, error: fetchError } = await supabaseAdmin
      .from('locker_state')
      .select('*')
      .eq('id', 1);

    if (fetchError) {
      console.error('Error fetching locker state:', {
        admin: user.email,
        error: fetchError.message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch current state' },
        { status: 500 }
      );
    }

    if (!currentStateData || currentStateData.length === 0) {
      console.error('Locker state not found:', {
        admin: user.email,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Locker state not found' },
        { status: 404 }
      );
    }

    const currentState = currentStateData[0];

    // Check if already unlocked and trying to increment
    if (currentState.is_unlocked && mode === 'increment') {
      console.warn('Attempted increment after unlock:', {
        admin: user.email,
        currentPercentage: currentState.energy_percentage,
        attemptedIncrement: value,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Unlock complete - no further increments allowed' },
        { status: 400 }
      );
    }

    // Calculate new energy percentage
    let newEnergyPercentage: number;
    if (mode === 'increment') {
      // Cap at 100
      newEnergyPercentage = Math.min(currentState.energy_percentage + value, 100);
    } else {
      newEnergyPercentage = value;
    }

    // Determine if unlock should happen
    const shouldUnlock = newEnergyPercentage >= 100 && !currentState.is_unlocked;

    // Update locker state using admin client
    const { data: updatedStateData, error: updateError } = await supabaseAdmin
      .from('locker_state')
      .update({
        energy_percentage: newEnergyPercentage,
        is_unlocked: shouldUnlock ? true : currentState.is_unlocked,
        last_updated: new Date().toISOString(),
      })
      .eq('id', 1)
      .select();

    if (updateError) {
      console.error('Error updating energy:', {
        admin: user.email,
        mode,
        value,
        currentPercentage: currentState.energy_percentage,
        newPercentage: newEnergyPercentage,
        error: updateError.message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Failed to update energy' },
        { status: 500 }
      );
    }

    if (!updatedStateData || updatedStateData.length === 0) {
      console.error('No data returned after update:', {
        admin: user.email,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'Update failed - no data returned' },
        { status: 500 }
      );
    }

    const updatedState = updatedStateData[0];

    // Insert audit log entry using admin client
    const actionType = mode === 'increment' ? 'energy_increment' : 'energy_set';
    const deltaOrValue = mode === 'increment' ? `+${value}%` : `set to ${value}%`;

    const { error: auditError } = await supabaseAdmin.from('audit_log').insert({
      admin_email: user.email!,
      action_type: actionType,
      subject: 'global_energy',
      delta_or_value: deltaOrValue,
      note: note || null,
    });

    if (auditError) {
      console.error('Error creating audit log:', {
        admin: user.email,
        action: actionType,
        subject: 'global_energy',
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
    console.error('Error in update-energy route:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
