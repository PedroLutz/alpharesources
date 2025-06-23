import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import MembroModel from '../../../../models/responsabilidade/Membro';
import FuncaoModel from '../../../../models/responsabilidade/Funcao';
import mongoose from 'mongoose';

const { Membro, MembroSchema } = MembroModel;
const { Funcao } = FuncaoModel;

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
        return res.status(400).json({ error: 'O ID do Membro é obrigatório para a atualização.' });
      }

      const propriedadesNomes = Object.keys(MembroSchema.paths);
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

      const membroOriginal = await Membro.findById(id);

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const updatedData = await Membro.findByIdAndUpdate(id, updateFields, { new: true }, { session });

        if (!updatedData) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ error: 'Membro não encontrado.' });
        }

        await Funcao.updateMany(
          { responsavel: membroOriginal.nome },
          { $set: { responsavel: updateFields.nome } }, { session }
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
    console.error('Erro ao atualizar o Membro', error);
    res.status(500).json({ error: 'Erro ao atualizar o Membro' });
  }
};