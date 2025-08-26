'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  const { data, error } = await client
    .from('gantt')
    .select(`
        id,
        wbs_item ( id, wbs_area (id, color, name), name),
        is_plan,
        start,
        end,
        status,
        gantt_dependency!gantt_dependency_duplicate_gantt_id_fkey (
      dependency_id
    )
        )`)
    .order('wbs_item(wbs_area->name)', { ascending: true })
    .order('wbs_item(name)', { ascending: true })

  console
  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}