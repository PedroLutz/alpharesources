import connectToDatabase from '../../../../../lib/db';
import AuditModel from '../../../../../models/riscos/Audit';

const { Audit, AuditSchema } = AuditModel;

export default async (req, res) => {
    try {
      await connectToDatabase();
  
      if (req.method === 'GET') {
          const riscoAudits = await Audit.find().sort({risco: 1});
    
          res.status(200).json({ riscoAudits });
      } else {
        res.status(405).json({ error: 'Método não permitido' });
      }
    } catch (error) {
      console.error('Erro ao buscar os Audits', error);
      res.status(500).json({ error: 'Erro ao buscar os Audits' });
    }
  };
  
