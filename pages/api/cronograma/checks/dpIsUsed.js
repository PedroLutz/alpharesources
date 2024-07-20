import connectToDatabase from '../../../../lib/db';
import GanttModel from '../../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'POST') {
            const {dp_area, dp_item} = req.body;
            const gantt = await Gantt.findOne({ area: dp_area, item: dp_item });

            if (gantt !== null) {
                res.json({ found: true });
            } else {
                res.json({ found: false });
            }

        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Planos', error);
        res.status(500).json({ error: 'Erro ao buscar os Planos' });
    }
};