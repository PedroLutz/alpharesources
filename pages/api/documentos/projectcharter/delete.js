import connectToDatabase from '../../../../lib/db';
import ProjectCharterModel from '../../../../models/documentos/ProjectCharter';

const { ProjectCharter } = ProjectCharterModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do ProjectCharter não foi fornecido' });
      }

      const deletedData = await ProjectCharter.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'ProjectCharter não encontrado' });
      }

      res.status(200).json({ message: 'ProjectCharter excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir ProjectCharter', error);
    res.status(500).json({ error: 'Erro ao excluir ProjectCharter' });
  }
};
