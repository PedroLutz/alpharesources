import connectToDatabase from '../../../../../lib/db';
import AuditModel from '../../../../../models/riscos/Audit';

const { Audit, AuditSchema } = AuditModel;

export default async (req, res) => {
    try {
      await connectToDatabase();
  
      if (req.method === 'GET') {
          const riscoAudits = await Audit.aggregate([
        {
          $lookup: {
            from: 'riscoAnalise',
            localField: 'risco',
            foreignField: 'risco',
            as: 'analisesData'
          }
        },
        {
          $unwind: '$analisesData'
        },
        {
          $sort: { risco: 1 } // ordena por item
        },
        {
          $project: {
            _id: 1,
            risco: 1,
            resposta: 1,
            impacto: 1,
            acao: 1,
            urgencia: 1,
            impactoFinanceiro: 1,
            impactoCronograma: 1,
            descricaoImpacto: 1,
            descricaoAvaliacao: 1,
            impactoPlano: '$analisesData.impacto',
            urgenciaPlano: '$analisesData.urgencia',
            acaoPlano: '$analisesData.acao',
            impactoFinanceiroPlano: '$analisesData.impactoFinanceiro',
            impactoCronogramaPlano: '$analisesData.impactoCronograma'
          }
        }
      ]);
    
          res.status(200).json({ riscoAudits });
      } else {
        res.status(405).json({ error: 'Método não permitido' });
      }
    } catch (error) {
      console.error('Erro ao buscar os Audits', error);
      res.status(500).json({ error: 'Erro ao buscar os Audits' });
    }
  };
  
