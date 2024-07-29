import connectToDatabase from '../../../../lib/db';
import PlanoModel from '../../../../models/financeiro/Plano';

const { Plano } = PlanoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Plano não foi fornecido' });
      }

      const deletedData = await Plano.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }

      res.status(200).json({ message: 'Plano excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Plano', error);
    res.status(500).json({ error: 'Erro ao excluir Plano' });
  }
};
