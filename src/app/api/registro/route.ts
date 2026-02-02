import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

interface RegistrationPayload {
  gestoriaName: string;
  slug: string;
  brandColor: string;
  email: string;
  password: string;
  fullName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationPayload = await request.json();

    // Validate required fields
    if (!body.gestoriaName || !body.slug || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(body.slug) || body.slug.length < 3 || body.slug.length > 50) {
      return NextResponse.json(
        { error: 'El slug debe tener entre 3 y 50 caracteres y solo contener letras, números y guiones' },
        { status: 400 }
      );
    }

    // Validate password length
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Validate brand color format
    const colorRegex = /^#[0-9a-fA-F]{6}$/;
    const brandColor = colorRegex.test(body.brandColor) ? body.brandColor : '#2563eb';

    const supabase = createServiceRoleClient();

    // Check if slug is already taken
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Este slug ya está en uso. Por favor, elige otro.' },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      );
    }

    // Create the tenant first
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: body.gestoriaName,
        slug: body.slug,
        brand_color: brandColor,
        is_active: true,
      })
      .select()
      .single();

    if (tenantError) {
      console.error('Tenant creation error:', tenantError);
      return NextResponse.json(
        { error: 'Error al crear la gestoría' },
        { status: 500 }
      );
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirm for beta testing
      user_metadata: {
        full_name: body.fullName,
      },
    });

    if (authError) {
      // Rollback: delete the tenant
      await supabase.from('tenants').delete().eq('id', tenant.id);

      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Error al crear la cuenta' },
        { status: 400 }
      );
    }

    // Create the user record in our users table
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: body.email,
      full_name: body.fullName,
      role: 'advisor',
      tenant_id: tenant.id,
    });

    if (userError) {
      // Rollback: delete auth user and tenant
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('tenants').delete().eq('id', tenant.id);

      console.error('User record error:', userError);
      return NextResponse.json(
        { error: 'Error al crear el registro de usuario' },
        { status: 500 }
      );
    }

    // User created successfully - Supabase will send verification email automatically
    // if email confirmations are enabled in the Supabase dashboard

    return NextResponse.json({
      success: true,
      tenant_slug: tenant.slug,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
