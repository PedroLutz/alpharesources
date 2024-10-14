import connectToDatabase from '../../../lib/db';
import GanttModel from '../../../models/Gantt';

const { Gantt, GanttSchema } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'O ID do Gantt é obrigatório para a atualização.' });
      }

      const updatedData = await Gantt.findByIdAndUpdate(id, { inicio: null, termino: null }, { new: true });

      if (!updatedData) {
        return res.status(404).json({ error: 'Gantt não encontrado.' });
      }

      return res.status(200).json(updatedData);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o Gantt', error);
    res.status(500).json({ error: 'Erro ao atualizar o Gantt' });
  }
};
