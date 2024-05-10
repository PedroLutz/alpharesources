import connectToDatabase from '../../../../lib/db';
import GanttModel from '../../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const cronogramas = await Gantt.find();
        const cronogramaPlanos = await Gantt.find({ plano: true });
        const cronogramaGantts = await Gantt.find({ plano: false});

        function sort(query) {
          query.sort((a, b) => {
            if (a.area < b.area) return -1;
            if (a.area > b.area) return 1;
            if (a.inicio < b.inicio) return -1;
            if (a.inicio > b.inicio) return 1;
            return 0;
          });
        }

        sort(cronogramas);
        sort(cronogramaPlanos);
        sort(cronogramaGantts);
  
        res.status(200).json({ cronogramas, cronogramaPlanos, cronogramaGantts });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Gantts', error);
    res.status(500).json({ error: 'Erro ao buscar os Gantts' });
  }
};
