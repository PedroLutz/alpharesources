import connectToDatabase from '../../../../../lib/db';
import EngajamentoModel from '../../../../../models/comunicacao/Engajamento';

const { Engajamento } = EngajamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const engajamentos = await Engajamento.find().sort({ grupo: 1, stakeholder: 1 });
  
        res.status(200).json({ engajamentos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Engajamentos', error);
    res.status(500).json({ error: 'Erro ao buscar os Engajamentos' });
  }
};
