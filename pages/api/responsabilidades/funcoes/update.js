import connectToDatabase from '../../../../lib/db';
import FuncaoModel from '../../../../models/responsabilidade/Funcao';
import HabilidadeModel from '../../../../models/responsabilidade/Habilidade';
import mongoose from 'mongoose';

const { Funcao, FuncaoSchema } = FuncaoModel;
const { Habilidade } = HabilidadeModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'O ID do Funcao é obrigatório para a atualização.' });
      }

      const propriedadesNomes = Object.keys(FuncaoSchema.paths);
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

      const funcaoOriginal = await Funcao.findById(id);

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const updatedData = await Funcao.findByIdAndUpdate(id, updateFields, { new: true });

        await Habilidade.updateMany(
          { funcao: funcaoOriginal.funcao },
          { funcao: updateFields.funcao }
        )

        if (!updatedData) {
          return res.status(404).json({ error: 'Funcao não encontrado.' });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(updatedData);
      } catch {
        await session.abortTransaction();
        session.endSession();
        console.error('Erro na transação:', error);
        return res.status(500).json({ error: 'Erro ao atualizar Funcao e areas relacionadas.' });
      }

    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o Funcao', error);
    res.status(500).json({ error: 'Erro ao atualizar o Funcao' });
  }
};
