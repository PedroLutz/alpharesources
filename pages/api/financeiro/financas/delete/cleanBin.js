import connectToDatabase from '../../../../lib/db';
import LancamentoModel from '../../../../models/financeiro/Lancamento';

const { Lancamento } = LancamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      const deletedData = await Lancamento.findByIdAndDelete(req.query.id);

      res.status(200).json({ message: 'Lancamentos excluídos com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Lancamento', error);
    res.status(500).json({ error: 'Erro ao excluir Lancamento' });
  }
};
