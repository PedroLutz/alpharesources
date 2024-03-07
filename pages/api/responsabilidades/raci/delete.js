// pages/api/delete.js
import connectToDatabase from '../../../../lib/db';
import Raci from '../../../../models/responsabilidade/Raci';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      // Verifique se o ID da pessoa a ser excluída é fornecido na solicitação
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do item RACI não foi fornecido' });
      }

      // Tente encontrar e excluir a pessoa com base no ID
      const deletedRaci = await Raci.findByIdAndDelete(req.query.id);

      if (!deletedRaci) {
        return res.status(404).json({ error: 'Item RACI não encontrado' });
      }

      res.status(200).json({ message: 'Item RACI excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir item RACI', error);
    res.status(500).json({ error: 'Erro ao excluir item RACI' });
  }
};
