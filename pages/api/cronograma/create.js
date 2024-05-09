import connectToDatabase from '../../../lib/db';
import GanttModel from '../../../models/Gantt';

const { Gantt, GanttSchema } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(GanttSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Gantt(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Gantt cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Gantt', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Gantt' });
  }
};
