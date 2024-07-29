import connectToDatabase from '../../../../../lib/db';
import RespostaModel from '../../../../../models/riscos/Resposta';

const { Resposta } = RespostaModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const respostas = await Resposta.find().sort({ risco: 1 });
  
        res.status(200).json({ respostas });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Respostas', error);
    res.status(500).json({ error: 'Erro ao buscar os Respostas' });
  }
};
