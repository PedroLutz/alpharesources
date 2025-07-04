import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import GanttModel from '../../../../models/Gantt';
import RiscoModel from '../../../../models/riscos/Risco';

const { Gantt } = GanttModel;
const { Risco } = RiscoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'POST') {
      const { monthYear } = req.body;
      const [year, month] = monthYear.split('-').map(Number);

      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      const nextStartDate = new Date(Date.UTC(year, month, 1));
      const nextEndDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      const tarefasConcluidas = await Gantt.find({
        termino: { $gte: startDate, $lte: endDate },
        situacao: "concluida",
        plano: false
      }, 'area item');

      const tarefasIniciadas = await Gantt.find({
        inicio: { $gte: startDate, $lte: endDate },
        plano: false,
      }, 'area item');

      const tarefasEmAndamentoConditions = [
        { termino: { $gte: endDate }, inicio: { $lte: startDate } },
        { inicio: { $lte: startDate }, termino: { $lte: startDate }, situacao: 'em andamento' },
        { inicio: { $gte: startDate, $lte: endDate }, termino: { $gte: endDate } }
      ];

      const tarefasEmAndamento = await Gantt.find({
        plano: false,
        $or: tarefasEmAndamentoConditions.length > 0 ? tarefasEmAndamentoConditions : [{}]
      }, 'area item');

      const tarefasPlanejadas = await Gantt.aggregate([
        {
          $match: {
            plano: true,
            inicio: { $gte: nextStartDate, $lte: nextEndDate }
          }
        },
        {
          $lookup: {
            from: 'gantt',
            let: { area: '$area', item: '$item' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$area', '$$area'] },
                      { $eq: ['$item', '$$item'] },
                      { $eq: ['$plano', false] },
                      {
                        $or: [
                          { $eq: ['$situacao', 'iniciar'] },
                          { $gte: ['$inicio', nextStartDate] }
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: 'plano_false'
          }
        },
        {
          $match: {
            plano_false: { $ne: [] }
          }
        },
        {
          $project: {
            area: 1,
            item: 1,
          }
        }
      ]);

      const areasItens = tarefasEmAndamento.map(tarefa => ({
        area: tarefa.area,
        item: tarefa.item
      }));

      const riscos = await Risco.find({
        $or: areasItens.length > 0 ? areasItens.map(({ area, item }) => ({
          area: area,
          item: item
        })) : [{ _id: null }]
      }, 'risco');

      res.status(200).json({
        tarefasConcluidas,
        tarefasIniciadas,
        tarefasEmAndamento,
        tarefasPlanejadas,
        riscos
      });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os dados do relatorio', error);
    res.status(500).json({ error: 'Erro ao buscar os dados do relatorio' });
  }
};