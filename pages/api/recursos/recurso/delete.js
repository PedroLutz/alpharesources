import connectToDatabase from '../../../../lib/db';
import RecursoModel from '../../../../models/recursos/Recurso';

const { Recurso } = RecursoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Recurso não foi fornecido' });
      }

      const deletedData = await Recurso.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Recurso não encontrado' });
      }

      res.status(200).json({ message: 'Recurso excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Recurso', error);
    res.status(500).json({ error: 'Erro ao excluir Recurso' });
  }
};
