import connectToDatabase from '../../../../../lib/db';
import StakeholderModel from '../../../../../models/comunicacao/Stakeholder';

const { Stakeholder } = StakeholderModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const gruposENomes = await Stakeholder.find({}, 'grupo stakeholder').sort({ grupo: 1, stakeholder: 1 });
  
        res.status(200).json({ gruposENomes });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Stakeholders', error);
    res.status(500).json({ error: 'Erro ao buscar os Stakeholders' });
  }
};
