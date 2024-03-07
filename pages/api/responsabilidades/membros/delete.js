// pages/api/delete.js
import connectToDatabase from '../../../../lib/db';
import Membro from '../../../../models/responsabilidade/Membro';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      // Verifique se o ID da pessoa a ser excluída é fornecido na solicitação
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do membro não foi fornecido' });
      }

      // Tente encontrar e excluir a pessoa com base no ID
      const deletedMembro = await Membro.findByIdAndDelete(req.query.id);

      if (!deletedMembro) {
        return res.status(404).json({ error: 'Membro não encontrado' });
      }

      res.status(200).json({ message: 'Membro excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir membro', error);
    res.status(500).json({ error: 'Erro ao excluir membro' });
  }
};
