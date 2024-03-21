// pages/api/get.js
import connectToDatabase from '../../../../lib/db';
import Raci from '../../../../models/responsabilidade/Raci';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const itensRaci = await Raci.find();

      // Agrupar os itens por área
      const groupedByArea = {};
      itensRaci.forEach(item => {
        if (!groupedByArea[item.area]) {
          groupedByArea[item.area] = [];
        }
        groupedByArea[item.area].push(item);
      });

      // Ordenar cada grupo de itens pela ordem natural
      Object.keys(groupedByArea).forEach(area => {
        groupedByArea[area].sort((a, b) => a.order - b.order);
      });

      // Concatenar todos os grupos ordenados
      const sortedItensRaci = Object.values(groupedByArea).flat();

      res.status(200).json({ itensRaci: sortedItensRaci });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar membros', error);
    res.status(500).json({ error: 'Erro ao buscar membros' });
  }
};
