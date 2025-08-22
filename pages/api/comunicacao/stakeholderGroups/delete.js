import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import StakeholderGroupModel from '../../../../models/comunicacao/StakeholderGroup';
import EngajamentoGrupoModel from '../../../../models/comunicacao/EngajamentoGrupo';
import mongoose from 'mongoose';

const { StakeholderGroup } = StakeholderGroupModel;
const { EngajamentoGrupo } = EngajamentoGrupoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do StakeholderGroup não foi fornecido' });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const deletedData = await StakeholderGroup.findByIdAndDelete(req.query.id);
        await EngajamentoGrupo.findOneAndDelete({
          grupo: deletedData.grupo
        })

        if (!deletedData) {
          return res.status(404).json({ error: 'StakeholderGroup não encontrado' });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'StakeholderGroup excluído com sucesso' });
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
    console.error('Erro ao excluir StakeholderGroup', error);
    res.status(500).json({ error: 'Erro ao excluir StakeholderGroup' });
  }
};