import connectToDatabase from '../../../../lib/db';
import Lancamento from '../../../../models/financeiro/Lancamento';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') { 
      const { id } = req.query; 

      if (!id) {
        return res.status(400).json({ error: 'O ID do lançamento é obrigatório para a atualização.' });
      }

      const { tipo, descricao, valor, data, area, origem, destino } = req.body;

      if (!tipo || !descricao || !valor || !data || !area || !origem || !destino) {
        return res.status(400).json({ error: 'O valor do lançamento é obrigatório para a atualização.' });
      }

      const updatedLancamento = await Lancamento.findByIdAndUpdate(id, { tipo, descricao, valor, data, area, origem, destino }, { new: true });

      if (!updatedLancamento) {
        return res.status(404).json({ error: 'Lançamento não encontrado.' });
      }

      return res.status(200).json(updatedLancamento);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o lançamento', error);
    res.status(500).json({ error: 'Erro ao atualizar o lançamento' });
  }
};
