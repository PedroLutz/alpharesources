import connectToDatabase from '../../../../lib/db';
import StakeholderModel from '../../../../models/comunicacao/Stakeholder';
import mongoose from 'mongoose';
import EngajamentoModel from '../../../../models/comunicacao/Engajamento';
import { update } from 'lodash';

const { Stakeholder, StakeholderSchema } = StakeholderModel;
const { Engajamento, EngajamentoSchema } = EngajamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'O ID do Stakeholder é obrigatório para a atualização.' });
      }

      const propriedadesNomes = Object.keys(StakeholderSchema.paths);
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

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const updatedData = await Stakeholder.findByIdAndUpdate(id, updateFields, { new: true });

        await Engajamento.updateOne(
          {grupo: updateFields.grupo, stakeholder: updateFields.stakeholder}, 
          {$set: {poder: updateFields.poder, interesse: updateFields.interesse}}
        )

        if (!updatedData) {
          return res.status(404).json({ error: 'Stakeholder não encontrado.' });
        }
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(updatedData);
      } catch {
        await session.abortTransaction();
        session.endSession();
        console.error('Erro na transação:', error);
        return res.status(500).json({ error: 'Erro ao atualizar Stakeholder e areas relacionadas.' });
      }
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o Stakeholder', error);
    res.status(500).json({ error: 'Erro ao atualizar o Stakeholder' });
  }
};
