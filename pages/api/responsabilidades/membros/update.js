import connectToDatabase from '../../../../lib/db';
import Membro from '../../../../models/responsabilidade/Membro';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') { 
      const { id } = req.query; 

      if (!id) {
        return res.status(400).json({ error: 'O ID do membro é obrigatório para a atualização.' });
      }

      const { nome, softskills, hardskills } = req.body;

      if (!nome || !softskills || !hardskills) {
        return res.status(400).json({ error: 'Todos os itens são necessários para atualizá-lo.' });
      }

      const updatedMembro = await Membro.findByIdAndUpdate(id, { nome, softskills, hardskills }, { new: true });

      if (!updatedMembro) {
        return res.status(404).json({ error: 'Lançamento não encontrado.' });
      }

      return res.status(200).json(updatedMembro);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o membro', error);
    res.status(500).json({ error: 'Erro ao atualizar o membro' });
  }
};
