import connectToDatabase from '../../../../lib/db';
import PlanoModel from '../../../../models/financeiro/Plano';
import RaciModel from '../../../../models/responsabilidade/Raci'
import GanttModel from '../../../../models/Gantt';

const { Raci } = RaciModel;
const { Plano } = PlanoModel;
const { Gantt } = GanttModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'POST') {
            const {area, item} = req.body;
            const plano = await Plano.findOne({ area: area, item: item });
            const elementoWBS = await Raci.findOne({ area: area, item: item });
            const gantt = await Gantt.findOne({ area: area, item: item });

            if (elementoWBS !== null || plano !== null || gantt !== null) {
                res.json({ found: true });
            } else {
                res.json({ found:false });
            }

        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Planos', error);
        res.status(500).json({ error: 'Erro ao buscar os Planos' });
    }
};
