import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import LancamentoModel from '../../../../models/financas/LancamentoFinanceiro';

const { Lancamento } = LancamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'DELETE') {
      const deletedData = await Lancamento.deleteMany({
        deletado: true
      });

      if (!deletedData) {
        return res.status(404).json({ error: 'Lancamento não encontrado' });
      }

      res.status(200).json({ message: 'Lancamentos excluídos com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Lancamento', error);
    res.status(500).json({ error: 'Erro ao excluir Lancamento' });
  }
};