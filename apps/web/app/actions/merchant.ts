'use server';

import { createClient } from '@/utils/supabase/server';
import { generateApiKey, hashApiKey } from '@/lib/security';
import { revalidatePath } from 'next/cache';

export async function rotateMerchantApiKey(merchantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  // Verify the user owns this merchant
  const { data: merchant, error: fetchError } = await supabase
    .from('merchants')
    .select('id, owner_id')
    .eq('id', merchantId)
    .single();

  if (fetchError || !merchant || merchant.owner_id !== user.id) {
    throw new Error('Unauthorized');
  }

  // Generate new key
  const newRawKey = generateApiKey();
  const hash = hashApiKey(newRawKey);

  // Update the database
  const { error: updateError } = await supabase
    .from('merchants')
    .update({ api_key_hash: hash })
    .eq('id', merchantId);

  if (updateError) {
    throw new Error('Failed to update API key');
  }

  revalidatePath('/dashboard/settings');
  
  return { 
    success: true, 
    key: newRawKey 
  };
}
