import connectToDatabase from '../../../../lib/db';
import GanttModel from '../../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const resultadosPlano = await Gantt.aggregate([
            {
              $match: { plano: true } 
            },
            {
              $group: {
                _id: "$area",
                primeiroInicio: { $min: "$inicio" },
                ultimoTermino: { $max: "$termino" }
              }
            },
            {
              $lookup: {
                from: 'gantt',
                let: { area: "$_id", inicio: "$primeiroInicio", termino: "$ultimoTermino" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $or: [
                          { 
                            $and: [
                              { $eq: ["$area", "$$area"] },
                              { $eq: ["$inicio", "$$inicio"] }
                            ]
                          },
                          { 
                            $and: [
                              { $eq: ["$area", "$$area"] },
                              { $eq: ["$termino", "$$termino"] }
                            ]
                          }
                        ]
                      }
                    }
                  },
                  {
                    $match: { plano: true }
                  },
                  {
                    $project: {
                      area: 1,
                      item: 1,
                      inicio: 1,
                      termino: 1,
                      situacao: 1
                    }
                  }
                ],
                as: "detalhes"
              }
            },
            {
              $unwind: "$detalhes"
            },
            {
              $group: {
                _id: "$_id",
                primeiro: {
                  $first: {
                    area: "$detalhes.area",
                    item: "$detalhes.item",
                    inicio: "$detalhes.inicio",
                    termino: "$detalhes.termino",
                    situacao: "$detalhes.situacao"
                  }
                },
                ultimo: {
                  $last: {
                    area: "$detalhes.area",
                    item: "$detalhes.item",
                    inicio: "$detalhes.inicio",
                    termino: "$detalhes.termino",
                    situacao: "$detalhes.situacao"
                  }
                }
              }
            },
            {
              $project: {
                _id: 0,
                area: "$_id",
                primeiro: {
                  item: "$primeiro.item",
                  inicio: "$primeiro.inicio",
                  termino: "$primeiro.termino",
                  situacao: '$primeiro.situacao'
                },
                ultimo: {
                  item: "$ultimo.item",
                  inicio: "$ultimo.inicio", 
                  termino: "$ultimo.termino", 
                  situacao: '$ultimo.situacao'
                }
              }
            }
          ]);
  
        res.status(200).json({ resultadosPlano });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Gantts', error);
    res.status(500).json({ error: 'Erro ao buscar os Gantts' });
  }
};
