import connectToDatabase from '../../../lib/db';
import Gantt from '../../../models/Gantt';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const { year, month } = req.query;

      const selectedYear = parseInt(year, 10);
      const selectedMonth = parseInt(month, 10);

      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
      const dataInicioProxMes = new Date(selectedYear, selectedMonth, 1);
      const dataFimProxMes = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

      const cronogramas = await Gantt.find();

      cronogramas.sort((a, b) => {
        if (a.area < b.area) return -1;
        if (a.area > b.area) return 1;
        if (a.inicio < b.inicio) return -1;
        if (a.inicio > b.inicio) return 1;
        return 0;
      });

      const iniciosNoMes = cronogramas.filter((elemento) => {
        return elemento.inicio >= startDate && elemento.inicio <= endDate;
      });

      const terminosNoMes = cronogramas.filter((elemento) => {
        return elemento.termino >= startDate && elemento.termino <= endDate;
      });

      const iniciosNoMesSeguinte = cronogramas.filter((elemento) => {
        return elemento.inicio >= dataInicioProxMes && elemento.inicio <= dataFimProxMes;
      });

      res.status(200).json({ cronogramas, iniciosNoMes, terminosNoMes, iniciosNoMesSeguinte});
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar elementos do cronograma', error);
    res.status(500).json({ error: 'Erro ao buscar elementos do cronograma' });
  }
};
