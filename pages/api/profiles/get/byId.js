'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    const client = createServerClient(token);

    const { data, error } = await client
        .from('profiles')
        .select(`is_editor`)
        .eq('id', req.body.user_id)
        .single();

    if (error) return res.status(400).json({ error: error.message })

    return res.status(200).json(data)
}