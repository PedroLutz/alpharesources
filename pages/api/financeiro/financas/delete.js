import connectToDatabase from '../../../../lib/db';
import Lancamento from '../../../../models/financeiro/Lancamento';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do lançamento não foi fornecido' });
      }

      const deletedLancamento = await Lancamento.findByIdAndDelete(req.query.id);

      if (!deletedLancamento) {
        return res.status(404).json({ error: 'Lançamento não encontrado' });
      }

      res.status(200).json({ message: 'Lançamento excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir lançamento', error);
    res.status(500).json({ error: 'Erro ao excluir lançamento' });
  }
};
