import connectToDatabase from '../../../../../lib/db';
import RiscoModel from '../../../../../models/riscos/Risco'; 
import RespostaModel from '../../../../../models/riscos/Resposta'; 
import ImpactoModel from '../../../../../models/riscos/Impacto'; 
import AuditModel from '../../../../../models/riscos/Audit'; 
import AnaliseModel from '../../../../../models/riscos/Analise'; 

const { Risco } = RiscoModel;
const { Resposta } = RespostaModel;
const { Impacto } = ImpactoModel;
const { Audit } = AuditModel;
const { Analise } = AnaliseModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { oldRisco, newRisco } = req.body;
      
      const updatedResposta = await Resposta
      .updateMany({ risco: oldRisco }, { $set: { risco: newRisco } });
      const updatedImpacto = await Impacto
      .updateMany({ risco: oldRisco }, { $set: { risco: newRisco } });
      const updatedAudit = await Audit
      .updateMany({ risco: oldRisco }, { $set: { risco: newRisco } });
      const updatedAnalise = await Analise
      .updateMany({ risco: oldRisco }, { $set: { risco: newRisco } });

      if (!updatedResposta) {
        return res.status(404).json({ error: 'Resposta não encontrada.' });
      }

      if (!updatedImpacto) {
        return res.status(404).json({ error: 'Impacto não encontrado.' });
      }

      if (!updatedAudit) {
        return res.status(404).json({ error: 'Audit não encontrado.' });
      }

      if (!updatedAnalise) {
        return res.status(404).json({ error: 'Analise não encontrada.' });
      }

      return res.status(200).send("ok");
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar os riscos', error);
    res.status(500).json({ error: 'Erro ao atualizar os riscos' });
  }
};
