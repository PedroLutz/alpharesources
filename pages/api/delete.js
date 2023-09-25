// pages/api/delete.js
import connectToDatabase from '../../lib/db';
import Lancamento from '../../models/Lancamento';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      // Verifique se o ID da pessoa a ser excluída é fornecido na solicitação
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID da pessoa não foi fornecido' });
      }

      // Tente encontrar e excluir a pessoa com base no ID
      const deletedLancamento = await Lancamento.findByIdAndDelete(req.query.id);

      if (!deletedLancamento) {
        return res.status(404).json({ error: 'Pessoa não encontrada' });
      }

      res.status(200).json({ message: 'Pessoa excluída com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir pessoa', error);
    res.status(500).json({ error: 'Erro ao excluir pessoa' });
  }
};
