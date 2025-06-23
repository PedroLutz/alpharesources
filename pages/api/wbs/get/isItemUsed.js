import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import PlanoAquisicaoModel from '../../../../models/recursos/PlanoAquisicao';
import RaciModel from '../../../../models/responsabilidade/Raci'
import GanttModel from '../../../../models/Gantt';
import RecursoModel from '../../../../models/recursos/Recurso';
import RiscoModel from '../../../../models/riscos/Risco';
import WbsDictionaryModel from '../../../../models/wbs/wbsDictionary';

const { Raci } = RaciModel;
const { PlanoAquisicao } = PlanoAquisicaoModel;
const { Gantt } = GanttModel;
const { Recurso } = RecursoModel;
const { Risco } = RiscoModel;
const { WbsDictionary } = WbsDictionaryModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        const user = verificarAuth(req);
        if (!user) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        if (req.method === 'POST') {
            const { area, item } = req.body;
            const plano = await PlanoAquisicao.findOne({ area: area, item: item });
            const raci = await Raci.findOne({ area: area, item: item });
            const gantt = await Gantt.findOne({ area: area, item: item });
            const recurso = await Recurso.findOne({ area: area, item: item });
            const risco = await Risco.findOne({ area: area, item: item });
            const wbsDictionary = await WbsDictionary.findOne({ area: area, item: item });

            if (raci !== null || plano !== null ||
                gantt !== null || recurso !== null ||
                risco !== null || wbsDictionary !== null) {
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