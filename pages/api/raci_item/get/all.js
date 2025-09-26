'use client';
import client from "../../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await client
    .from('raci_item')
    .select(`
        id,
        item_id,
        member_id,
        responsibility`)
    .order('item_id', { ascending: true })
    .order('member_id', { ascending: true });

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}