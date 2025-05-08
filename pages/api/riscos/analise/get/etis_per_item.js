import connectToDatabase from '../../../../../lib/db';
import AnaliseModel from '../../../../../models/riscos/Analise';

const { Analise, AnaliseSchema } = AnaliseModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Buscar todas as análises
      const etis = await Analise.aggregate([
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
            $match: { 'riscoData.ehNegativo': true }
        },
        {
          $addFields: {
            valorCalculado: {
              $multiply: [
                { $divide: ['$ocorrencia', 5] },
                '$impactoCronograma'
              ]
            }
          }
        },
        {
          $group: {
            _id: '$riscoData.item',
            totalETI: { $sum: '$valorCalculado' },
          }
        },
        {
          $match: { totalETI: { $ne: 0 } } // Remove os que resultaram em 0
        },
        {
          $sort: { _id: 1 } // ordena por item
        },
        {
          $project: {
            item: '$_id',
            totalETI: 1,
            _id: 0
          }
        }
      ]);
      
      const resultadosAgrupados = {};
      for (let eti of etis) {
        resultadosAgrupados[eti.item] = eti.totalETI;
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
