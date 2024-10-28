import connectToDatabase from '../../../../lib/db';
import GanttModel from '../../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const cronogramaPlanos = await Gantt.find({ plano: true}).sort({ area: 1, inicio: 1, termino: 1 }); // Ordena por area, depois por inicio e termino;

        // function sort(query) {
        //   query.sort((a, b) => {
        //     if (a.area < b.area) return -1;
        //     if (a.area > b.area) return 1;
        //     if (a.inicio < b.inicio) return -1;
        //     if (a.inicio > b.inicio) return 1;
        //     return 0;
        //   });
        // }

        // sort(cronogramaPlanos);
  
        res.status(200).json({ cronogramaPlanos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Gantts', error);
    res.status(500).json({ error: 'Erro ao buscar os Gantts' });
  }
};
