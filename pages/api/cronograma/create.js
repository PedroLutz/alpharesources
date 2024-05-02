import connectToDatabase from '../../../lib/db';
import Gantt from '../../../models/Gantt';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { plano, item, area, inicio, termino, dp_item, dp_area, situacao } = req.body;

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
