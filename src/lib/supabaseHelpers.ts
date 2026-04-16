// This file is no longer needed — all tables are typed in integrations/supabase/types.ts.
// Kept as a stub so any remaining imports don't break.
import { supabase } from '@/integrations/supabase/client'

/** @deprecated Use supabase.from() directly */
export function fromTable(table: Parameters<typeof supabase.from>[0]) {
  return supabase.from(table)
}
