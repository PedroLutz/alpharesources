import connectToDatabase from '../../../../../lib/db';
import PlanoAquisicaoModel from '../../../../../models/recursos/PlanoAquisicao';

const { PlanoAquisicao } = PlanoAquisicaoModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const valoresPorArea_all = await PlanoAquisicao.aggregate([
                {
                    $group: {
                        _id: "$area",
                        totalValorA: { $sum: "$valor_a" },
                        totalValorB: { $sum: "$valor_b" }
                    }
                },
                {
                    $sort: {
                        _id: 1 
                    }
                }
            ]);

            const valoresPorArea_Essencial = await PlanoAquisicao.aggregate([
                {
                    $match: {
                        ehEssencial: true
                    }
                },
                {
                    $group: {
                        _id: "$area",
                        totalValorA: { $sum: "$valor_a" },
                        totalValorB: { $sum: "$valor_b" }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]);

            res.status(200).json({ valoresPorArea_all, valoresPorArea_Essencial });
        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Planos', error);
        res.status(500).json({ error: 'Erro ao buscar os Planos' });
    }
};
