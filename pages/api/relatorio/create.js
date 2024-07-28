import connectToDatabase from '../../../lib/db';
import ReportModel from '../../../models/Report';

const { Report, ReportSchema } = ReportModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(ReportSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Report(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Report cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Report', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Report' });
  }
};
