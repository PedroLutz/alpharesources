// pages/api/delete.js
import connectToDatabase from '../../../lib/db';
import Plano from '../../../models/financeiro/Plano';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      // Verifique se o ID da pessoa a ser excluída é fornecido na solicitação
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do plano não foi fornecido' });
      }

      // Tente encontrar e excluir a pessoa com base no ID
      const deletedPlano = await Plano.findByIdAndDelete(req.query.id);

      if (!deletedPlano) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }

      res.status(200).json({ message: 'Plano excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir plano', error);
    res.status(500).json({ error: 'Erro ao excluir plano' });
  }
};
