import { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let resultado;
        const body = req.body;

        const token = req.headers.authorization?.replace('Bearer ', '');
        const client = createServerClient(token);

        const { gantt_id, dependency_id } = body;

        if (!gantt_id || !dependency_id) {
            return res.status(400).json({ error: 'Missing gantt_id or dependency_id' });
        }

        const { data, error } = await client.from('gantt_dependency').delete().eq('gantt_id', gantt_id).eq('dependency_id', dependency_id).select();
        if (error) throw error;
        resultado = data;

        return res.status(200).json({ success: true, resultado });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}