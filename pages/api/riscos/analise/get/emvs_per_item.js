import connectToDatabase from '../../../../../lib/db';
import AnaliseModel from '../../../../../models/riscos/Analise';
import RiscoModel from '../../../../../models/riscos/Risco';

const { Analise, AnaliseSchema } = AnaliseModel;
const { Risco, RiscoSchema } = RiscoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Buscar todas as análises
      const emvs = await Analise.find({}, 'ocorrencia impactoFinanceiro risco');

      // Objeto para agrupar as somas por área
      const resultadosAgrupados = {};

      // Iterar pelas análises
      for (let emv of emvs) {
        const risco = await Risco.findOne({ risco: emv.risco }, 'area item');
        
        if (risco && risco.area && risco.item) {
          const item = risco.item;
          const valorCalculado = (emv.ocorrencia / 5) * emv.impactoFinanceiro;

          if(!resultadosAgrupados[item]){
              resultadosAgrupados[item] = 0;
          }

          resultadosAgrupados[item] += valorCalculado;

          if(resultadosAgrupados[item] === 0){
            delete resultadosAgrupados[item];
          }
        }
      }

      // Retorna o resultado agrupado por área
      res.status(200).json({ resultadosAgrupados });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Analises', error);
    res.status(500).json({ error: 'Erro ao buscar os Analises' });
  }
};
