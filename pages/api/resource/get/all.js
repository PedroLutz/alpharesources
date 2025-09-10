'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
    const client = createServerClient(token);

  const { data, error } = await client
    .from('resource')
    .select(`
        id,
        wbs_item (
            id,
            wbs_area (
                id,
                name,
                color
            ),
            name
        ),
        resource,
        usage,
        type,
        is_essential`)
    .order('wbs_item(wbs_area->name)', { ascending: true })
    .order('wbs_item(name)', { ascending: true })
    .order('resource', { ascending: true });

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}