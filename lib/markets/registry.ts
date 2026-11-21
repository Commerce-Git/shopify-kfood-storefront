import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const activeCountries = unstable_cache(async (): Promise<string[]> => {
  const { data, error } = await supabaseAdmin.from('pricing_markets')
    .select('country').eq('status', 'active').order('sort_order');
  if (error) throw new Error('Could not load shipping destinations.');
  return data.map(row => row.country);
}, ['active-shipping-destinations'], { revalidate: 60 });
