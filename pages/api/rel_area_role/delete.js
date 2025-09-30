'use client';
import { createServerClient } from "../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);
  
  const { role_id, area_id } = req.body;
  const { data, error } = await client.from('rel_area_role').delete().eq('role_id', role_id).eq('area_id', area_id);

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}