import connectToDatabase from '../../../../lib/db';
import StakeholderModel from '../../../../models/Stakeholder';

const { Stakeholder } = StakeholderModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const stakeholders = await Stakeholder.find();
  
        res.status(200).json({ stakeholders });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Stakeholders', error);
    res.status(500).json({ error: 'Erro ao buscar os Stakeholders' });
  }
};
