import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import AnaliseModel from '../../../../../models/riscos/Analise';
import RiscoModel from '../../../../../models/riscos/Risco';

const { Analise } = AnaliseModel;
const { Risco } = RiscoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      // Buscar todas as análises
      const emvs = await Analise.find({}, 'ocorrencia impactoFinanceiro risco');
      let somaEmvs = 0;

      // Objeto para agrupar as somas por área
      const resultadosAgrupados = {};

      // Iterar pelas análises
      for (let emv of emvs) {
        const risco = await Risco.findOne({ risco: emv.risco }, 'area');
        somaEmvs = somaEmvs + (emv.ocorrencia / 5 * emv.impactoFinanceiro)

        if (risco && risco.area) {
          const area = risco.area;
          const valorCalculado = (emv.ocorrencia / 5) * emv.impactoFinanceiro;

          if (!resultadosAgrupados[area]) {
            resultadosAgrupados[area] = 0;
          }

          resultadosAgrupados[area] += valorCalculado;

          if (resultadosAgrupados[area] === 0) {
            delete resultadosAgrupados[area];
          }
        }
      }
      resultadosAgrupados.Total = somaEmvs;

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