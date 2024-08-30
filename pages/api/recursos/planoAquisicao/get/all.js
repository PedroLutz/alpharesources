import connectToDatabase from '../../../../../lib/db';
import PlanoAquisicaoModel from '../../../../../models/recursos/PlanoAquisicao';

const { PlanoAquisicao } = PlanoAquisicaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const planos = await PlanoAquisicao.find().sort({ recurso: 1 });


      res.status(200).json({ planos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os PlanoAquisicaos', error);
    res.status(500).json({ error: 'Erro ao buscar os PlanoAquisicaos' });
  }
};