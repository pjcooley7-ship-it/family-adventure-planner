/**
 * Helper to query Supabase tables that exist in the database
 * but aren't yet reflected in the auto-generated types.ts.
 *
 * Usage:
 *   const { data } = await fromTable('my_table').select('*').eq('id', x)
 *
 * Once types.ts is regenerated with the full schema, replace
 * fromTable('x') calls with supabase.from('x') and remove this file.
 */
import { supabase } from '@/integrations/supabase/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromTable(table: string) {
  return (supabase as any).from(table)
}
