import connectToDatabase from '../../../../lib/db';
import LicaoModel from '../../../../models/monitoramento/Licao';

const { Licao } = LicaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Licao não foi fornecido' });
      }

      const deletedData = await Licao.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Licao não encontrado' });
      }

      res.status(200).json({ message: 'Licao excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Licao', error);
    res.status(500).json({ error: 'Erro ao excluir Licao' });
  }
};
