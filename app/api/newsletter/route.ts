import { subscribeCustomer } from '@/lib/shopify/subscription';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function syncConsent(email: string) {
  const { error } = await supabaseAdmin.from('storefront_customers')
    .update({ marketing_consent: true, updated_at: new Date().toISOString() })
    .eq('email', email);
  if (error) throw error;
}

export function POST(request: Request) {
  return subscribeCustomer(request, 'newsletter', syncConsent);
}
