import connectToDatabase from '../../../lib/db';
import StakeholderModel from '../../../models/comunicacao/Stakeholder';

const { Stakeholder } = StakeholderModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Stakeholder não foi fornecido' });
      }

      const deletedData = await Stakeholder.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Stakeholder não encontrado' });
      }

      res.status(200).json({ message: 'Stakeholder excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Stakeholder', error);
    res.status(500).json({ error: 'Erro ao excluir Stakeholder' });
  }
};
