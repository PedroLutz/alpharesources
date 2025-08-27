import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
    try {
        let resultado;
        const body = req.body;

        const token = req.headers.authorization?.replace('Bearer ', '');
        const client = createServerClient(token);

        const { id } = body;
        const { data, error } = await client.from('gantt_dependency').delete().eq('gantt_id', id);
        if (error) throw error;
        resultado = data;

        return res.status(200).json({ success: true, resultado });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}