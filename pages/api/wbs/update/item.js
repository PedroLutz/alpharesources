import connectToDatabase from '../../../../lib/db';
import WbsModel from '../../../../models/wbs/wbs';
import PlanoModel from '../../../../models/financeiro/Plano'
import RaciModel from '../../../../models/responsabilidade/Raci'
import GanttModel from '../../../../models/Gantt'

const { Wbs, WbsSchema } = WbsModel;
const { Plano } = PlanoModel;
const { Raci } = RaciModel;
const { Gantt } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'O ID do Wbs é obrigatório para a atualização.' });
      }

      const propriedadesNomes = Object.keys(WbsSchema.paths);
      const updateFields = {};
      
      for (const key in req.body) {
        if (req.body[key]) {
          if (propriedadesNomes.includes(key)) {
            updateFields[key] = req.body[key];
          } else {
            return res.status(400).json({ error: 'Os campos fornecidos não são compatíveis com o do modelo!' });
          }
        }
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para a atualização.' });
      }
      const oldWBS = await Wbs.findById(id);

      const updatedWBS = await Wbs.findByIdAndUpdate(id, updateFields, { new: true });
      const updatedPlano = await Plano.updateMany(
        { area: oldWBS.area, item: oldWBS.item }, { $set: { item: updateFields.item } }
      );
      const updatedGantt = await Gantt.updateMany(
        { area: oldWBS.area, item: oldWBS.item }, { $set: { item: updateFields.item } }
      );
      const updatedGanttDp = await Gantt.updateMany(
        { dp_area: oldWBS.area, dp_item: oldWBS.item }, { $set: { dp_item: updateFields.item } }
      );
      const updatedRaci = await Raci.updateMany(
        { area: oldWBS.area, item: oldWBS.item }, { $set: { item: updateFields.item } }
      );

      if (!updatedWBS) {
        return res.status(404).json({ error: 'Wbs não encontrado.' });
      }

      return res.status(200).json(updatedWBS);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o Wbs', error);
    res.status(500).json({ error: 'Erro ao atualizar o Wbs' });
  }
};
