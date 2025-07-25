import connectToDatabase from '../../../../lib/db';
import StakeholderModel from '../../../../models/comunicacao/Stakeholder';
import mongoose from 'mongoose';
import EngajamentoModel from '../../../../models/comunicacao/Engajamento';
import InformacaoModel from '../../../../models/comunicacao/Informacao';
import { verificarAuth } from '../../../../lib/verifica_auth';

const { Stakeholder, StakeholderSchema } = StakeholderModel;
const { Engajamento } = EngajamentoModel;
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

      const stakeholderOriginal = await Stakeholder.findById(id);

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const updatedData = await Stakeholder.findByIdAndUpdate(id, updateFields, { new: true }, { session });
        if (!updatedData) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ error: 'Stakeholder não encontrado.' });
        }

        await Engajamento.updateOne(
          { grupo: stakeholderOriginal.grupo, stakeholder: stakeholderOriginal.stakeholder },
          { $set: { stakeholder: updateFields.stakeholder, poder: updateFields.poder, interesse: updateFields.interesse } }, { session }
        )

        await Informacao.updateMany(
          { grupo: stakeholderOriginal.grupo, stakeholder: stakeholderOriginal.stakeholder },
          { $set: { stakeholder: updateFields.stakeholder } }, { session }
        )

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