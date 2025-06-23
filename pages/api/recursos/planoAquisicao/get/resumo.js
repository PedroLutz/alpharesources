import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import PlanoAquisicaoModel from '../../../../../models/recursos/PlanoAquisicao';

const { PlanoAquisicao } = PlanoAquisicaoModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        const user = verificarAuth(req);
        if (!user) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        if (req.method === 'GET') {
            const linhaDoTempoAll = await PlanoAquisicao.aggregate([
                {
                    $group: {
                        _id: "$recurso",
                        data_esperada: { $first: "$data_esperada" },
                        data_limite: { $first: "$data_limite" }
                    }
                }
            ]);

            const linhaDoTempoEssencial = await PlanoAquisicao.aggregate([
                {
                    $match: {
                        ehEssencial: true
                    }
                },
                {
                    $group: {
                        _id: "$recurso",
                        data_esperada: { $first: "$data_esperada" },
                        data_limite: { $first: "$data_limite" }
                    }
                }
            ]);
            res.status(200).json({
                linhaDoTempoEssencial, linhaDoTempoAll
            });
        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Planos', error);
        res.status(500).json({ error: 'Erro ao buscar os Planos' });
    }
};