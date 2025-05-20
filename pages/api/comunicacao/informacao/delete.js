import connectToDatabase from '../../../../lib/db';
import InformacaoModel from '../../../../models/comunicacao/Informacao';

const { Informacao } = InformacaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Informacao não foi fornecido' });
      }

      const deletedData = await Informacao.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Informacao não encontrado' });
      }

      res.status(200).json({ message: 'Informacao excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Informacao', error);
    res.status(500).json({ error: 'Erro ao excluir Informacao' });
  }
};
