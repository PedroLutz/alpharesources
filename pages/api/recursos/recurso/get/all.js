import connectToDatabase from '../../../../../lib/db';
import RecursoModel from '../../../../../models/recursos/Recurso';

const { Recurso } = RecursoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const recursos = await Recurso.find().sort({ area: 1, item: 1, recurso: 1 });


      res.status(200).json({ recursos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Recursos', error);
    res.status(500).json({ error: 'Erro ao buscar os Recursos' });
  }
};