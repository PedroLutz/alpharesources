import connectToDatabase from '../../../../../lib/db';
import LicaoModel from '../../../../../models/monitoramento/Licao';

const { Licao } = LicaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const licoes = await Licao.find().sort({ data: 1, situacao: 1 });


      res.status(200).json({ licoes });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Licaos', error);
    res.status(500).json({ error: 'Erro ao buscar os Licaos' });
  }
};