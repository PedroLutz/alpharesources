import connectToDatabase from '../../../lib/db';
import GanttModel from '../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      const {area, item} = req.body;

      const deletedData = await Gantt.findOneAndDelete({area: area, item: item, plano: false});

      if (!deletedData) {
        return res.status(404).json({ error: 'Gantt não encontrado' });
      }

      res.status(200).json({ message: 'Gantt excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Gantt', error);
    res.status(500).json({ error: 'Erro ao excluir Gantt' });
  }
};
