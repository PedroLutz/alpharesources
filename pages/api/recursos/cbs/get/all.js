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
      const cbs = await PlanoAquisicao.aggregate([
        {
          $lookup: {
            from: 'recursos', // nome da coleção no MongoDB
            localField: 'recurso',
            foreignField: 'recurso',
            as: 'recursoData'
          }
        },
        {
          $unwind: '$recursoData' // transforma o array em objeto
        },
        {
          $group: {
            _id: {
              area: '$area',
              item: '$recursoData.item'
            },
            totalValorEssencialA: {
              $sum: {
                $cond: [{ $eq: ['$ehEssencial', true] }, '$valor_a', 0]
              }
            },
            totalValorEssencialB: {
              $sum: {
                $cond: [{ $eq: ['$ehEssencial', true] }, '$valor_b', 0]
              }
            },
            totalValorIdealA: {
              $sum: '$valor_a'
            },
            totalValorIdealB: {
              $sum: '$valor_b'
            },
            totalCustoReal: {
              $sum: '$valor_real'
            }
          }
        },
        {
          $project: {
            area: '$_id.area',
            item: '$_id.item',
            custo_essencial: {
              $divide: [
                {
                  $add: [
                    { $multiply: ['$totalValorEssencialA', 2] },
                    '$totalValorEssencialB'
                  ]
                },
                3
              ]
            },
            custo_ideal: {
              $divide: [
                {
                  $add: [
                    { $multiply: ['$totalValorIdealA', 2] },
                    '$totalValorIdealB'
                  ]
                },
                3
              ]
            },
            custo_real: "$totalCustoReal",
            _id: 0
          }
        },
        {
          $sort: { area: 1, item: 1 }
        }
      ]);

      res.status(200).json({ cbs });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Cbss', error);
    res.status(500).json({ error: 'Erro ao buscar os Cbss' });
  }
};