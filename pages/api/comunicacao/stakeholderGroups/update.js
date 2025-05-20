import connectToDatabase from '../../../../lib/db';
import StakeholderGroupModel from '../../../../models/comunicacao/StakeholderGroup';
import StakeholderModel from '../../../../models/comunicacao/Stakeholder';
import EngajamentoModel from '../../../../models/comunicacao/Engajamento';
import InformacaoModel from '../../../../models/comunicacao/Informacao';
import mongoose from 'mongoose';

const { StakeholderGroup, StakeholderGroupSchema } = StakeholderGroupModel;
const { Stakeholder, StakeholderSchema } = StakeholderModel;
const { Engajamento, EngajamentoSchema } = EngajamentoModel;
const { Informacao, InformacaoSchema } = InformacaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'O ID do StakeholderGroup é obrigatório para a atualização.' });
      }

      const propriedadesNomes = Object.keys(StakeholderGroupSchema.paths);
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

      const grupoOriginal = await StakeholderGroup.findById(id);

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const updatedData = await StakeholderGroup.findByIdAndUpdate(id, updateFields, { new: true });

        await Stakeholder.updateMany(
          {grupo: grupoOriginal.grupo},
          {$set: {grupo: updateFields.grupo}}
        )

        await Engajamento.updateMany(
          {grupo: grupoOriginal.grupo},
          {$set: {grupo: updateFields.grupo}}
        )

        await Informacao.updateMany(
          {grupo: grupoOriginal.grupo},
          {$set: {grupo: updateFields.grupo}}
        )

        if (!updatedData) {
          return res.status(404).json({ error: 'StakeholderGroup não encontrado.' });
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
    console.error('Erro ao atualizar o StakeholderGroup', error);
    res.status(500).json({ error: 'Erro ao atualizar o StakeholderGroup' });
  }
};
