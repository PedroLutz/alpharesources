import connectToDatabase from '../../../../../lib/db';
import CbsModel from '../../../../../models/recursos/CbStructure';

const { Cbs, CbsSchema } = CbsModel;

export default async (req, res) => {
    try {
      await connectToDatabase();
  
      if (req.method === 'GET') {
          const cbs = await Cbs.find().sort({area: 1, item: 1});
    
          res.status(200).json({ cbs });
      } else {
        res.status(405).json({ error: 'Método não permitido' });
      }
    } catch (error) {
      console.error('Erro ao buscar os Cbss', error);
      res.status(500).json({ error: 'Erro ao buscar os Cbss' });
    }
  };
  
