import connectToDatabase from '../../../../../lib/db';
import ImpactoModel from '../../../../../models/riscos/Impacto';

const { Impacto, ImpactoSchema } = ImpactoModel;

export default async (req, res) => {
    try {
      await connectToDatabase();
  
      if (req.method === 'GET') {
          const riscoImpactos = await Impacto.find().sort({risco: 1});
    
          res.status(200).json({ riscoImpactos });
      } else {
        res.status(405).json({ error: 'Método não permitido' });
      }
    } catch (error) {
      console.error('Erro ao buscar os Impactos', error);
      res.status(500).json({ error: 'Erro ao buscar os Impactos' });
    }
  };
  
