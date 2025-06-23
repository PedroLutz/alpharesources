import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import GanttModel from '../../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const registroMaisAntigo = await Gantt.findOne({ plano: true }, 'inicio').sort({ inicio: 1 });

      res.status(200).json({ registroMaisAntigo });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Gantts', error);
    res.status(500).json({ error: 'Erro ao buscar os Gantts' });
  }
};
