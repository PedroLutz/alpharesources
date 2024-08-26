import connectToDatabase from '../../../../lib/db';
import GanttModel from '../../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const duracaoPorAreaPlano = await Gantt.aggregate([
            {
                $match: { plano: true }
              },
              {
                $group: {
                  _id: "$area",
                  inicioMaisAnterior: { $min: "$inicio" },
                  terminoMaisPosterior: { $max: "$termino" }
                }
              },
              {
                $match: {
                  inicioMaisAnterior: { $ne: new Date('1970-01-01T00:00:00Z') },
                  terminoMaisPosterior: { $ne: new Date('1970-01-01T00:00:00Z') }
                }
              },
              {
                $project: {
                  _id: 1,
                  duracaoEmDias: {
                    $divide: [
                      { $subtract: ["$terminoMaisPosterior", "$inicioMaisAnterior"] },
                      1000 * 60 * 60 * 24 // converter milissegundos para dias
                    ]
                  }
                }
              }
          ]);

          const duracaoPorAreaGantt = await Gantt.aggregate([
            {
                $match: { plano: false }
              },
              {
                $group: {
                  _id: "$area",
                  inicioMaisAnterior: { $min: "$inicio" },
                  terminoMaisPosterior: { $max: "$termino" }
                }
              },
              {
                $match: {
                  inicioMaisAnterior: { $ne: new Date('1970-01-01T00:00:00Z') },
                  terminoMaisPosterior: { $ne: new Date('1970-01-01T00:00:00Z') }
                }
              },
              {
                $project: {
                  _id: 1,
                  duracaoEmDias: {
                    $divide: [
                      { $subtract: ["$terminoMaisPosterior", "$inicioMaisAnterior"] },
                      1000 * 60 * 60 * 24 // converter milissegundos para dias
                    ]
                  }
                }
              },
              {
                $sort: {
                  _id: 1 // Ordena `_id` (que representa `area`) em ordem decrescente
                }
              }
          ]);

          const trueDurationsMap = duracaoPorAreaPlano.reduce((acc, item) => {
            acc[item._id] = item.duracaoEmDias;
            return acc;
          }, {});
          
          // Em seguida, calcular a porcentagem para plano === false
          const percentageComparison = duracaoPorAreaGantt.map(item => {
            const duracaoTrue = trueDurationsMap[item._id];
            const duracaoFalse = item.duracaoEmDias;
            
            return {
              area: item._id,
              duracaoTrue: duracaoTrue,
              duracaoFalse: duracaoFalse,
              porcentagem: duracaoTrue ? (duracaoFalse / duracaoTrue) * 100 : null
            };
          });
  
        res.status(200).json({ percentageComparison });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Gantts', error);
    res.status(500).json({ error: 'Erro ao buscar os Gantts' });
  }
};
