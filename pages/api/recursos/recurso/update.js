import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import RecursoModel from '../../../../models/recursos/Recurso';
import PlanoAquisicaoModel from '../../../../models/recursos/PlanoAquisicao';
import mongoose from 'mongoose';

const { Recurso, RecursoSchema } = RecursoModel;
const { PlanoAquisicao } = PlanoAquisicaoModel;

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
        return res.status(400).json({ error: 'O ID do Recurso é obrigatório para a atualização.' });
      }

      const propriedadesNomes = Object.keys(RecursoSchema.paths);
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

      // INÍCIO DA SESSION
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const recursoAntigo = await Recurso.findById(id).session(session);
        if (!recursoAntigo) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ error: 'Recurso não encontrado.' });
        }

        const updatedRecurso = await Recurso.findByIdAndUpdate(id, updateFields, { new: true, session });

        // Atualiza o plano correspondente, se existir
        const planoRelacionado = await PlanoAquisicao.findOne({
          recurso: recursoAntigo.recurso,
          area: recursoAntigo.area
        }).session(session);

        if (planoRelacionado) {
          const updatePlanoFields = {};
          if ('ehEssencial' in updateFields) {
            updatePlanoFields.ehEssencial = updateFields.ehEssencial;
          }
          if ('recurso' in updateFields) {
            updatePlanoFields.recurso = updateFields.recurso;
          }
          if ('area' in updateFields) {
            updatePlanoFields.area = updateFields.area;
          }

          if (Object.keys(updatePlanoFields).length > 0) {
            await PlanoAquisicao.updateOne({ _id: planoRelacionado._id }, { $set: updatePlanoFields }, { session });
          }
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(updatedRecurso);
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Erro na transação:', error);
        return res.status(500).json({ error: 'Erro ao atualizar recurso e plano.' });
      }
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao conectar ou preparar atualização', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};