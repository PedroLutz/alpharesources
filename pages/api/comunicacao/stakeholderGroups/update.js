import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import StakeholderGroupModel from '../../../../models/comunicacao/StakeholderGroup';
import StakeholderModel from '../../../../models/comunicacao/Stakeholder';
import EngajamentoModel from '../../../../models/comunicacao/Engajamento';
import EngajamentoGrupoModel from '../../../../models/comunicacao/EngajamentoGrupo';
import InformacaoModel from '../../../../models/comunicacao/Informacao';
import mongoose from 'mongoose';

const { StakeholderGroup, StakeholderGroupSchema } = StakeholderGroupModel;
const { Stakeholder } = StakeholderModel;
const { Engajamento } = EngajamentoModel;
const { EngajamentoGrupo } = EngajamentoGrupoModel;
const { Informacao } = InformacaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

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
        const updatedData = await StakeholderGroup.findByIdAndUpdate(id, updateFields, { new: true }, { session });

        if (!updatedData) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ error: 'StakeholderGroup não encontrado.' });
        }

        await Stakeholder.updateMany(
          { grupo: grupoOriginal.grupo },
          { $set: { grupo: updateFields.grupo } },
          { session }
        )

        await Engajamento.updateMany(
          { grupo: grupoOriginal.grupo },
          { $set: { grupo: updateFields.grupo } },
          { session }
        )

        await Informacao.updateMany(
          { grupo: grupoOriginal.grupo },
          { $set: { grupo: updateFields.grupo } },
          { session }
        )

        await EngajamentoGrupo.updateMany(
          { grupo: grupoOriginal.grupo },
          { $set: { grupo: updateFields.grupo } },
          { session }
        )

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(updatedData);
      } catch (error) {
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