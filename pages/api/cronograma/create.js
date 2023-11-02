// pages/api/create.js
import connectToDatabase from '../../../lib/db';
import Gantt from '../../../models/Gantt';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { codigo, item, area, } = req.body;

      // Crie um novo objeto Person com os dados da solicitação
      const newCronograma = new Gantt({
        plano,
        item,
        area,
        inicio,
        termino,
        dp_item,
        dp_area,
        situacao
      });

      // Salve no banco de dados
      await newCronograma.save();

      res.status(201).json({ message: 'Cronograma cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o cronograma', error);
    res.status(500).json({ error: 'Erro ao cadastrar o cronograma' });
  }
};
