import connectToDatabase from '../../../../../lib/db';
import AnaliseModel from '../../../../../models/riscos/Analise';

const { Analise, AnaliseSchema } = AnaliseModel;

export default async (req, res) => {
    try {
      await connectToDatabase();
  
      if (req.method === 'GET') {
          const emvs = await Analise.find({}, 'ocorrencia impactoFinanceiro');

          let valor = 0;
          emvs.forEach((emv) => {
            
            valor = valor + (emv.ocorrencia / 5 * emv.impactoFinanceiro)
          })
    
          

          res.status(200).json({ valor });
      } else {
        res.status(405).json({ error: 'Método não permitido' });
      }
    } catch (error) {
      console.error('Erro ao buscar os Analises', error);
      res.status(500).json({ error: 'Erro ao buscar os Analises' });
    }
  };
  
