import connectToDatabase from '../../../../lib/db';
import GanttModel from '../../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const ganttPorArea = await Gantt.aggregate([
          {
            $match: { plano: false }
          },
          {
            $group: {
              _id: "$area",
              itens: {
                $push: {
                  item: "$item",
                  situacao: "$situacao"
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              area: "$_id",
              itens: 1
            }
          },
          {
            $sort: { area: 1 }
          }
        ]);

        return res.status(200).json({ ganttPorArea });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Gantts', error);
    res.status(500).json({ error: 'Erro ao buscar os Gantts' });
  }
};
