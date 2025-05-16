import connectToDatabase from '../../../../../lib/db';
import StakeholderGroupModel from '../../../../../models/comunicacao/StakeholderGroup';

const { StakeholderGroup } = StakeholderGroupModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const stakeholderGroups = await StakeholderGroup.find();
  
        res.status(200).json({ stakeholderGroups });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os StakeholderGroups', error);
    res.status(500).json({ error: 'Erro ao buscar os StakeholderGroups' });
  }
};
