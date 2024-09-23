import connectToDatabase from '../../../lib/db';
import WbsDictionaryModel from '../../../models/wbs/wbsDictionary';

const { WbsDictionary } = WbsDictionaryModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do WbsDictionary não foi fornecido' });
      }

      const deletedData = await WbsDictionary.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'WbsDictionary não encontrado' });
      }

      res.status(200).json({ message: 'WbsDictionary excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir WbsDictionary', error);
    res.status(500).json({ error: 'Erro ao excluir WbsDictionary' });
  }
};
