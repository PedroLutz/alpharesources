import connectToDatabase from '../../../../lib/db';
import WbsModel from '../../../../models/wbs/wbs';
import PlanoModel from '../../../../models/financeiro/Plano'
import RecursoModel from '../../../../models/recursos/Recurso'
import RaciModel from '../../../../models/responsabilidade/Raci'
import GanttModel from '../../../../models/Gantt'

const { Wbs } = WbsModel;
const { Plano } = PlanoModel;
const { Raci } = RaciModel;
const { Gantt } = GanttModel;
const { Recurso } = RecursoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { area, oldArea } = req.body;

      const updatedData = await Wbs.updateMany({ area: oldArea }, { $set: { area: area } });
      const updatedPlano = await Plano.updateMany(
        { area: oldArea }, { $set: { area: area } }
      );
      const updatedRecurso = await Recurso.updateMany(
        { area: oldArea }, { $set: { area: area } }
      );
      const updatedGantt = await Gantt.updateMany(
        { area: oldArea }, { $set: { area: area } }
      );
      const updatedGanttdp = await Gantt.updateMany(
        { dp_area: oldArea }, { $set: { dp_area: area } }
      );
      const updatedRaci = await Raci.updateMany(
        { area: oldArea }, { $set: { area: area } }
      );

      if (!updatedData) {
        return res.status(404).json({ error: 'Wbs não encontrado.' });
      }

      return res.status(200).json(updatedData);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o Wbs', error);
    res.status(500).json({ error: 'Erro ao atualizar o Wbs' });
  }
};
