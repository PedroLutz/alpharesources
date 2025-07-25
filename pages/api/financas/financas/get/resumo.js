import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import LancamentoModel from '../../../../../models/financas/LancamentoFinanceiro';

const { Lancamento } = LancamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const somaValores = await Lancamento.aggregate([
        {
          $match: {
            tipo: { $ne: 'Exchange' },
            deletado: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valor' }
          }
        }
      ]);


      const receitasTotais = await Lancamento.aggregate([
        {
          $match: {
            tipo: { $in: ['Income', 'Exchange'] },
            deletado: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valor' }
          }
        }
      ]);

      const despesasTotais = await Lancamento.aggregate([
        {
          $match: {
            tipo: { $in: ['Expense', 'Exchange'] },
            deletado: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $cond: [{ $eq: ['$tipo', 'Expense'] }, '$valor', { $multiply: ['$valor', -1] }] } }
          }
        }
      ]);


      const receitasPorArea = await Lancamento.aggregate([
        {
          $match: {
            tipo: { $in: ['Income', 'Exchange'] },
            deletado: false
          }
        },
        {
          $group: {
            _id: '$area',
            total: { $sum: '$valor' }
          }
        }
      ]);

      const despesasPorArea = await Lancamento.aggregate([
        {
          $match: {
            tipo: { $in: ['Expense', 'Exchange'] },
            deletado: false
          }
        },
        {
          $group: {
            _id: '$area',
            total: { $sum: { $cond: [{ $eq: ['$tipo', 'Expense'] }, '$valor', { $multiply: ['$valor', -1] }] } }
          }
        },
        {
          $sort: {
            _id: 1 // Ordena `_id` (que representa `area`) em ordem decrescente
          }
        }
      ]);

      const receitasPorMes = await Lancamento.aggregate([
        {
          $match: {
            tipo: { $in: ['Income', 'Exchange'] },
            deletado: false
          }
        },
        {
          $project: {
            monthYear: {
              $dateToString: {
                format: '%Y/%m',
                date: '$data'
              }
            },
            valor: 1
          }
        },
        {
          $group: {
            _id: '$monthYear',
            total: { $sum: '$valor' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const despesasPorMes = await Lancamento.aggregate([
        {
          $match: {
            tipo: { $in: ['Expense', 'Exchange'] },
            deletado: false
          }
        },
        {
          $project: {
            monthYear: {
              $dateToString: {
                format: '%Y/%m',
                date: '$data'
              }
            },
            valor: {
              $cond: [
                { $eq: ['$tipo', 'Exchange'] },
                { $multiply: ['$valor', -1] },
                '$valor'
              ]
            }
          }
        },
        {
          $group: {
            _id: '$monthYear',
            total: { $sum: '$valor' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);


      const maiorEMenorValor = await Lancamento.aggregate([
        {
          $match: {
            deletado: false
          }
        },
        {
          $group: {
            _id: null,
            min: { $min: '$valor' },
            max: { $max: '$valor' },
          }
        }
      ])

      res.status(200).json({
        somaValores,
        receitasPorArea,
        despesasPorArea,
        receitasPorMes,
        despesasPorMes,
        maiorEMenorValor,
        receitasTotais,
        despesasTotais
      });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Lancamentos', error);
    res.status(500).json({ error: 'Erro ao buscar os Lancamentos' });
  }
};