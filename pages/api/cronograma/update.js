import connectToDatabase from '../../../lib/db';
import Gantt from '../../../models/Gantt';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') { 
      const { id } = req.query; 

      if (!id) {
        return res.status(400).json({ error: 'O ID do lançamento é obrigatório para a atualização.' });
      }

      const { inicio,termino, dp_item, dp_area, situacao,} = req.body; 

      const updateFields = {};
      if (inicio) updateFields.inicio = inicio;
      if (termino) updateFields.termino = termino;
      if (situacao) updateFields.situacao = situacao;
      if (dp_item) updateFields.termino = termino;
      if (dp_area) updateFields.situacao = situacao;


      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para a atualização.' });
      }

      const updatedCronograma = await Gantt.findByIdAndUpdate(id, updateFields, { new: true });

      if (!updatedCronograma) {
        return res.status(404).json({ error: 'Cronograma não encontrado.' });
      }

      return res.status(200).json(updatedCronograma);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o cronograma', error);
    res.status(500).json({ error: 'Erro ao atualizar o cronograma' });
  }
};
