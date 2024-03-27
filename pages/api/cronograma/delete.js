import connectToDatabase from '../../../lib/db';
import Gantt from '../../../models/Gantt';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do cronograma não foi fornecido' });
      }

      const deletedCronograma = await Gantt.findByIdAndDelete(req.query.id);

      if (!deletedCronograma) {
        return res.status(404).json({ error: 'Cronograma não encontrado' });
      }

      res.status(200).json({ message: 'Cronograma excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir cronograma', error);
    res.status(500).json({ error: 'Erro ao excluir cronograma' });
  }
};
