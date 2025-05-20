import connectToDatabase from '../../../../lib/db';
import StakeholderModel from '../../../../models/comunicacao/Stakeholder';
import EngajamentoModel from '../../../../models/comunicacao/Engajamento';
import mongoose from 'mongoose';

const { Stakeholder } = StakeholderModel;
const { Engajamento } = EngajamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Stakeholder não foi fornecido' });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try{
        const deletedData = await Stakeholder.findByIdAndDelete(req.query.id);
        await Engajamento.findOneAndDelete({
          grupo: deletedData.grupo, stakeholder: deletedData.stakeholder
        })

        if (!deletedData) {
          return res.status(404).json({ error: 'Stakeholder não encontrado' });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Stakeholder excluído com sucesso' });
      } catch {
        await session.abortTransaction();
        session.endSession();
        console.error('Erro na transação:', error);
        return res.status(500).json({ error: 'Erro ao deletar Stakeholders e areas relacionadas.' });
      }

      
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Stakeholder', error);
    res.status(500).json({ error: 'Erro ao excluir Stakeholder' });
  }
};
