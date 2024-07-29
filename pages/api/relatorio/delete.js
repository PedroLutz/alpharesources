import connectToDatabase from '../../../lib/db';
import ReportModel from '../../../models/Report';

const { Report } = ReportModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Report não foi fornecido' });
      }

      const deletedData = await Report.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Report não encontrado' });
      }

      res.status(200).json({ message: 'Report excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Report', error);
    res.status(500).json({ error: 'Erro ao excluir Report' });
  }
};
