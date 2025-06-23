import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import HabilidadeModel from '../../../../models/responsabilidade/Habilidade';

const { Habilidade } = HabilidadeModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Habilidade não foi fornecido' });
      }

      const deletedData = await Habilidade.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Habilidade não encontrado' });
      }

      res.status(200).json({ message: 'Habilidade excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Habilidade', error);
    res.status(500).json({ error: 'Erro ao excluir Habilidade' });
  }
};