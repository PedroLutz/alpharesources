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

    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'O ID do Lancamento é obrigatório para a atualização.' });
      }

      const updatedData = await Lancamento.findByIdAndUpdate(id, { deletado: req.body }, { new: true });

      if (!updatedData) {
        return res.status(404).json({ error: 'Lancamento não encontrado.' });
      }

      return res.status(200).json(updatedData);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o Lancamento', error);
    res.status(500).json({ error: 'Erro ao atualizar o Lancamento' });
  }
};