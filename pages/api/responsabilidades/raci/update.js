import connectToDatabase from '../../../../lib/db';
import Raci from '../../../../models/responsabilidade/Raci';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') { 
      const { id } = req.query; 

      if (!id) {
        return res.status(400).json({ error: 'O ID do item RACI é obrigatório para a atualização.' });
      }

      const { area, item, responsabilidades } = req.body;

      if (!area || !item || !responsabilidades) {
        return res.status(400).json({ error: 'Todos os itens são necessários para atualizá-lo.' });
      }

      const updatedRaci = await Raci.findByIdAndUpdate(id, { area, item, responsabilidades }, { new: true });

      if (!updatedRaci) {
        return res.status(404).json({ error: 'Item RACI não encontrado.' });
      }

      return res.status(200).json(updatedRaci);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o item RACI', error);
    res.status(500).json({ error: 'Erro ao atualizar o item RACI' });
  }
};
