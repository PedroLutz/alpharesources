import connectToDatabase from '../../../../lib/db';
import RespostaModel from '../../../../models/riscos/Resposta';

const { Resposta } = RespostaModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Resposta não foi fornecido' });
      }

      const deletedData = await Resposta.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Resposta não encontrado' });
      }

      res.status(200).json({ message: 'Resposta excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Resposta', error);
    res.status(500).json({ error: 'Erro ao excluir Resposta' });
  }
};
