import connectToDatabase from '../../../../../lib/db';
import PlanoModel from '../../../../../models/financeiro/Plano';

const { Plano } = PlanoModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const valoresPorArea = await Plano.aggregate([
                {
                  $match: {
                    plano: "Ideal scenario"
                  }
                },
                {
                  $group: {
                    _id: "$area",
                    totalValorA: { $sum: "$valor_a" }
                  }
                },
                {
                  $sort: {
                    _id: 1 // Ordena `_id` (que representa `area`) em ordem decrescente
                  }
                }
              ]);

            res.status(200).json({ valoresPorArea });
        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Planos', error);
        res.status(500).json({ error: 'Erro ao buscar os Planos' });
    }
};
