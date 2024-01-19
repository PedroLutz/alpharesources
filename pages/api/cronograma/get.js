// pages/api/wbs/get.js
import connectToDatabase from '../../../lib/db';
import Gantt from '../../../models/Gantt';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const { year, month } = req.query;

      // Converta year e month para números inteiros
      const selectedYear = parseInt(year, 10);
      const selectedMonth = parseInt(month, 10);

      // Crie uma data de início e uma data de término para o mês selecionado
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
      const dataInicioProxMes = new Date(selectedYear, selectedMonth, 1);
      const dataFimProxMes = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

      // Use a query 'cronogramas' para buscar todos os elementos de Gantt
      const cronogramas = await Gantt.find();

      // Crie uma nova query filtrando os elementos com base na data de início
      const iniciosNoMes = cronogramas.filter((elemento) => {
        return elemento.inicio >= startDate && elemento.inicio <= endDate;
      });

      const terminosNoMes = cronogramas.filter((elemento) => {
        return elemento.termino >= startDate && elemento.termino <= endDate;
      });

      const iniciosNoMesSeguinte = cronogramas
      .filter((elemento) => {
        return elemento.inicio >= dataInicioProxMes && elemento.termino <= dataFimProxMes;
      })
      .map((elemento) => {
        // Ajuste da data para iniciosNoMesSeguinte
        const adjustedInicio = new Date(elemento.inicio);
        adjustedInicio.setDate(adjustedInicio.getDate() + 1);
        return { ...elemento, inicio: adjustedInicio.toISOString() };
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
