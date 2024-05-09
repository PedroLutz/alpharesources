import connectToDatabase from '../../../lib/db';
import RaciModel from '../../../../models/responsabilidade/Raci';

const { Raci } = RaciModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Raci não foi fornecido' });
      }

      const deletedData = await Raci.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Raci não encontrado' });
      }

      res.status(200).json({ message: 'Raci excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Raci', error);
    res.status(500).json({ error: 'Erro ao excluir Raci' });
  }
};
