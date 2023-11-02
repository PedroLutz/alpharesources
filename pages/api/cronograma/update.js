// pages/api/update.js
import connectToDatabase from '../../../../lib/db';
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
      const { inicio, termino, situacao } = req.body; // Você pode adicionar outros campos conforme necessário

      // Verifique se o valor é fornecido
      if (!inicio || !termino || !situacao) {
        return res.status(400).json({ error: 'O valor do lançamento é obrigatório para a atualização.' });
      }

      // Atualize o lançamento no banco de dados
      const updatedCronograma = await Gantt.findByIdAndUpdate(id, { inicio, termino, situacao }, { new: true });

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
