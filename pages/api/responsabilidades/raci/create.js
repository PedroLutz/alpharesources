// pages/api/create.js
import connectToDatabase from '../../../../lib/db';
import Raci from '../../../../models/responsabilidade/Raci';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { area, item, responsabilidades } = req.body;

      // Crie um novo objeto Person com os dados da solicitação
      const newRaci = new Raci({
        area, item, responsabilidades
      });

      // Salve no banco de dados
      await newRaci.save();

      res.status(201).json({ message: 'Item RACI cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o item RACI', error);
    res.status(500).json({ error: 'Erro ao cadastrar o item RACI' });
  }
};
