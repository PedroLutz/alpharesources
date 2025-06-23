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
      const valoresPorMes = await PlanoAquisicao.aggregate([
        {
          $match: {
            data_esperada: { $ne: null } // garante que só entra quem tem data válida
          }
        },
        {
          $group: {
            _id: {
              ano: { $year: "$data_esperada" },
              mes: { $month: "$data_esperada" }
            },
            total_valor_a: { $sum: "$valor_a" },
            total_valor_b: { $sum: "$valor_b" }
          }
        },
        {
          $project: {
            _id: 0,
            mes: {
              $concat: [
                { $toString: "$_id.ano" },
                "/",
                {
                  $cond: [
                    { $lte: ["$_id.mes", 9] },
                    { $concat: ["0", { $toString: "$_id.mes" }] },
                    { $toString: "$_id.mes" }
                  ]
                }
              ]
            },
            total_valor_a: 1,
            total_valor_b: 1
          }
        },
        {
          $sort: { mes: 1 } // ordena cronologicamente
        }
      ])


      res.status(200).json({ valoresPorMes });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Planos', error);
    res.status(500).json({ error: 'Erro ao buscar os Planos' });
  }
};