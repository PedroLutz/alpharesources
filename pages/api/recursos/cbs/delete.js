import connectToDatabase from '../../../../lib/db';
import CbsModel from '../../../../models/recursos/cbs';

const { Cbs } = CbsModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Cbs não foi fornecido' });
      }

      const deletedData = await Cbs.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'Cbs não encontrado' });
      }

      res.status(200).json({ message: 'Cbs excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Cbs', error);
    res.status(500).json({ error: 'Erro ao excluir Cbs' });
  }
};
