import connectToDatabase from '../../../../../lib/db';
import ProjectCharterModel from '../../../../../models/documentos/ProjectCharter';

const { ProjectCharter } = ProjectCharterModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const lancamentos = await ProjectCharter.find();


      res.status(200).json({ lancamentos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os ProjectCharters', error);
    res.status(500).json({ error: 'Erro ao buscar os ProjectCharters' });
  }
};
