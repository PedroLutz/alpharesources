import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import WbsModel from '../../../../models/wbs/wbs';
import WbsDictionaryModel from '../../../../models/wbs/wbsDictionary'
import PlanoAquisicaoModel from '../../../../models/recursos/PlanoAquisicao';
import RecursoModel from '../../../../models/recursos/Recurso'
import RaciModel from '../../../../models/responsabilidade/Raci'
import GanttModel from '../../../../models/Gantt'
import LancamentoModel from '../../../../models/financas/LancamentoFinanceiro'
import RiscoModel from '../../../../models/riscos/Risco';
import HabilidadeModel from '../../../../models/responsabilidade/Habilidade';
import MudancaModel from '../../../../models/monitoramento/Mudanca';
import mongoose from 'mongoose';

const { Wbs } = WbsModel;
const { PlanoAquisicao } = PlanoAquisicaoModel;
const { Raci } = RaciModel;
const { Gantt } = GanttModel;
const { Recurso } = RecursoModel;
const { Lancamento } = LancamentoModel;
const { Risco } = RiscoModel;
const { WbsDictionary } = WbsDictionaryModel;
const { Habilidade } = HabilidadeModel;
const { Mudanca } = MudancaModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'PUT') {
      const { area, oldArea } = req.body;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const updatedData = await Wbs.updateMany({ area: oldArea }, { $set: { area: area } }, { session });
        if (!updatedData) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ error: 'WBS não encontrado.' });
        }

        await PlanoAquisicao.updateMany({ area: oldArea }, { $set: { area: area } }, { session });
        await Recurso.updateMany({ area: oldArea }, { $set: { area: area } }, { session });
        await Lancamento.updateMany({ area: oldArea }, { $set: { area: area } }, { session });
        await Gantt.updateMany({ area: oldArea }, { $set: { area: area } }, { session });
        await Gantt.updateMany({ dp_area: oldArea }, { $set: { dp_area: area } }, { session });
        await Raci.updateMany({ area: oldArea }, { $set: { area: area } }, { session });
        await Risco.updateMany({ area: oldArea }, { $set: { area: area } }, { session });
        await WbsDictionary.updateMany({ area: oldArea }, { $set: { area: area } }, { session });
        await Habilidade.updateMany({ area: oldArea }, { $set: { area: area } }, { session });
        await Mudanca.updateMany({ area: oldArea }, { $set: { area: area } }, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Erro na transação:', error);
        return res.status(500).json({ error: 'Erro ao atualizar WBS coisas relacionadas.' });
      }
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o Wbs', error);
    res.status(500).json({ error: 'Erro ao atualizar o Wbs' });
  }
};