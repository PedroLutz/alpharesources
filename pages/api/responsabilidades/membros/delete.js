import connectToDatabase from '../../../lib/db';
import MembroModel from '../../../../models/responsabilidade/Membro';

const { Membro } = MembroModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Membro não foi fornecido' });
      }

      const deletedData = await Membro.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Membro não encontrado' });
      }

      res.status(200).json({ message: 'Membro excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Membro', error);
    res.status(500).json({ error: 'Erro ao excluir Membro' });
  }
};
