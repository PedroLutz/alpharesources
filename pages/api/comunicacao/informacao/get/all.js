import connectToDatabase from '../../../../../lib/db';
import InformacaoModel from '../../../../../models/comunicacao/Informacao';

const { Informacao } = InformacaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const informacoes = await Informacao.find().sort({ grupo: 1, stakeholder: 1, informacao: 1 });
  
        res.status(200).json({ informacoes });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Informacaos', error);
    res.status(500).json({ error: 'Erro ao buscar os Informacaos' });
  }
};
