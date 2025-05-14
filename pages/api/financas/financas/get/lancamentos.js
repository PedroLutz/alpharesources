import connectToDatabase from '../../../../../lib/db';
import LancamentoModel from '../../../../../models/financas/LancamentoFinanceiro';

const { Lancamento } = LancamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const lancamentos = await Lancamento.find().sort({ data: 1, descricao: 1 });


      res.status(200).json({ lancamentos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Lancamentos', error);
    res.status(500).json({ error: 'Erro ao buscar os Lancamentos' });
  }
};
