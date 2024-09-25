import connectToDatabase from '../../../../lib/db';
import WbsModel from '../../../../models/wbs/wbs';

const { Wbs } = WbsModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { area, cor } = req.body;
      const updatedData = await Wbs.updateMany({ area: area }, { $set: { cor: cor } });

      if (!updatedData) {
        return res.status(404).json({ error: 'Wbs não encontrado.' });
      }

      return res.status(200).json(updatedData);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o Wbs', error);
    res.status(500).json({ error: 'Erro ao atualizar o Wbs' });
  }
};