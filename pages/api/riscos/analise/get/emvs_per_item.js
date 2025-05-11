import connectToDatabase from '../../../../../lib/db';
import AnaliseModel from '../../../../../models/riscos/Analise';

const { Analise, AnaliseSchema } = AnaliseModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Buscar todas as análises
      const emvs = await Analise.aggregate([
        {
          $match: { impactoFinanceiro: { $gt: 0 } }
        },
        {
          $lookup: {
            from: 'riscos',
            localField: 'risco',
            foreignField: 'risco',
            as: 'riscoData'
          }
        },
        {
          $unwind: '$riscoData'
        },
        {
          $addFields: {
            valorCalculado: {
              $multiply: [
                { $divide: ['$ocorrencia', 5] },
                '$impactoFinanceiro'
              ]
            }
          }
        },
        {
          $group: {
            _id: '$riscoData.item',
            totalEMV: { $sum: '$valorCalculado' }
          }
        },
        {
          $match: { totalEMV: { $ne: 0 } } // Remove os que resultaram em 0
        },
        {
          $sort: { _id: 1 } // ordena por item
        },
        {
          $project: {
            item: '$_id',
            totalEMV: 1,
            _id: 0
          }
        }
      ]);

      console.log(emvs);
      
      const resultadosAgrupados = {};
      for (let emv of emvs) {
        resultadosAgrupados[emv.item] = emv.totalEMV;
      }

      // Retorna o resultado agrupado por área
      res.status(200).json({ resultadosAgrupados });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Analises', error);
    res.status(500).json({ error: 'Erro ao buscar os Analises' });
  }
};
