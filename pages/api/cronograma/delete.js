import connectToDatabase from '../../../lib/db';
import GanttModel from '../../../models/Gantt';
import mongoose from 'mongoose';

const { Gantt } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do Gantt não foi fornecido' });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try{
        const deletedData = await Gantt.findByIdAndDelete(req.query.id);

        if (!deletedData) {
          await session.abortTransaction();
          return res.status(404).json({ error: 'Gantt não encontrado' });
        }

        await Gantt.findOneAndDelete({area: deletedData.area, item: deletedData.item, plano: false});

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Gantt excluído com sucesso' });
      } catch {
        await session.abortTransaction();
        session.endSession();
        console.error('Erro na transação:', error);
        return res.status(500).json({ error: 'Erro ao atualizar WBS coisas relacionadas.' });
      }

      
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir Gantt', error);
    res.status(500).json({ error: 'Erro ao excluir Gantt' });
  }
};
