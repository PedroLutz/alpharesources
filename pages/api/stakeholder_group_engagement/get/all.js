'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  const { data, error } = await client
    .from('stakeholder_group_engagement')
    .select(`
        id,
        stakeholder_group (
            id,
            group
        ),
        dependency,
        influence,
        control,
        impact,
        engagement,
        alignment,
        eng_level,
        eng_target_level
        `)
    .order('stakeholder_group(group)', { ascending: true })

  if (error) {return res.status(400).json({ error: error.message })}

  return res.status(200).json(data)
}