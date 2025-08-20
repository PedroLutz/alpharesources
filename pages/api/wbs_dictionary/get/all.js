'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  const { data, error } = await client
    .from('wbs_dictionary')
    .select(`
        id, 
        wbs_item (
            id,
            name,
            wbs_area (
                id,
                name,
                color
            )
        ),
        description,
        purpose,
        criteria,
        inspection,
        timing,
        responsible,
        approval_responsible,
        premises,
        restrictions,
        resources`
    )
    .order('wbs_item(wbs_area->name)', { ascending: true })
    .order('wbs_item(name)', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}