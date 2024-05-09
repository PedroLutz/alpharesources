import connectToDatabase from '../../../../lib/db';
import LancamentoModel from '../../../../models/financeiro/Lancamento';

const { Lancamento } = LancamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'O ID do Lancamento é obrigatório para a atualização.' });
      }

      const updatedData = await Lancamento.findByIdAndUpdate(id, {deletado: true}, { new: true });

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
