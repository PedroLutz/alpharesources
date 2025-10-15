'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  const { data, error } = await client
    .from('change')
    .select(`
        id,
        date,
        wbs_area (
            id,
            name,
            color
        ),
        responsible_request,
        responsible_approval,
        type,
        item,
        change,
        reasoning,
        impact,
        is_approved,
        status`)
    .order('date', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}