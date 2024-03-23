// pages/api/update.js
import connectToDatabase from '../../../lib/db';
import Gantt from '../../../models/Gantt';

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
      const { inicio,termino, dp_item, dp_area, situacao,} = req.body; // Você pode adicionar outros campos conforme necessário

      const updateFields = {};
      if (inicio) updateFields.inicio = inicio;
      if (termino) updateFields.termino = termino;
      if (situacao) updateFields.situacao = situacao;
      if (dp_item) updateFields.termino = termino;
      if (dp_area) updateFields.situacao = situacao;


      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para a atualização.' });
      }

      // Atualize o lançamento no banco de dados
      const updatedCronograma = await Gantt.findByIdAndUpdate(id, updateFields, { new: true });

      if (!updatedCronograma) {
        return res.status(404).json({ error: 'Lançamento não encontrado.' });
      }

      return res.status(200).json(updatedCronograma);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o lançamento', error);
    res.status(500).json({ error: 'Erro ao atualizar o lançamento' });
  }
};
