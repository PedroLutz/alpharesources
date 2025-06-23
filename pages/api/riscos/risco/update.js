import connectToDatabase from '../../../../lib/db';
import RiscoModel from '../../../../models/riscos/Risco';
import RespostaModel from '../../../../models/riscos/Resposta';
import ImpactoModel from '../../../../models/riscos/Impacto';
import AuditModel from '../../../../models/riscos/Audit';
import AnaliseModel from '../../../../models/riscos/Analise';
import mongoose from 'mongoose';

const { Risco, RiscoSchema } = RiscoModel;
const { Resposta } = RespostaModel;
const { Impacto } = ImpactoModel;
const { Audit } = AuditModel;
const { Analise } = AnaliseModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'O ID do Risco é obrigatório para a atualização.' });
      }

      const propriedadesNomes = Object.keys(RiscoSchema.paths);
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

      const riscoOriginal = await Risco.findById(id);

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const updatedData = await Risco.findByIdAndUpdate(id, updateFields, { new: true }, { session });

        if (!updatedData) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ error: 'Risco não encontrado.' });
        }

        await Resposta.updateMany(
          { risco: riscoOriginal.risco },
          { $set: { risco: updateFields.risco } }, { session }
        );
        await Impacto.updateMany(
          { risco: riscoOriginal.risco },
          { $set: { risco: updateFields.risco } }, { session }
        );
        await Audit.updateMany(
          { risco: riscoOriginal.risco },
          { $set: { risco: updateFields.risco } }, { session }
        );
        await Analise.updateMany(
          { risco: riscoOriginal.risco },
          { $set: { risco: updateFields.risco } }, { session }
        );

        await session.commitTransaction();
        session.endSession();
        
        return res.status(200).json(updatedData);
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Erro na transação:', error);
        return res.status(500).json({ error: 'Erro ao atualizar Risco e areas relacionadas.' });
      }


    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o Risco', error);
    res.status(500).json({ error: 'Erro ao atualizar o Risco' });
  }
};
