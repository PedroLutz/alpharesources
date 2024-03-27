// pages/api/update.js
import connectToDatabase from '../../../../lib/db';
import Plano from '../../../../models/financeiro/Plano';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') { // Use o método PUT para atualizar
      const { id } = req.query; // O id do lançamento a ser atualizado

      // Verifique se o id é fornecido
      if (!id) {
        return res.status(400).json({ error: 'O ID do lançamento é obrigatório para a atualização.' });
      }

      // Os dados atualizados do lançamento podem ser passados no corpo da solicitação
      const { plano, area, item, recurso, uso,  tipo_a, valor_a, plano_a, data_inicial, data_esperada, data_limite, plano_b, tipo_b, valor_b } = req.body; // Você pode adicionar outros campos conforme necessário

      // Verifique se o valor é fornecido
      if (!plano || !area || !item || !recurso || !uso ||  !tipo_a || !valor_a || !plano_a || !data_inicial || !data_esperada || !data_limite || !plano_b || !tipo_b || !valor_b) {
        return res.status(400).json({ error: 'O valor do lançamento é obrigatório para a atualização.' });
      }

      // Atualize o lançamento no banco de dados
      const updatedPlano = await Plano.findByIdAndUpdate(id, { plano, area, item, recurso, uso,  tipo_a, valor_a, plano_a, data_inicial, data_esperada, data_limite, plano_b, tipo_b, valor_b }, { new: true });

      if (!updatedPlano) {
        return res.status(404).json({ error: 'Lançamento não encontrado.' });
      }

      return res.status(200).json(updatedPlano);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o lançamento', error);
    res.status(500).json({ error: 'Erro ao atualizar o lançamento' });
  }
};