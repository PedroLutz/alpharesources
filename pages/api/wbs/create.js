// pages/api/create.js
import connectToDatabase from '../../../lib/db';
import Elemento from '../../../models/WorkBS';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { codigo, item, area, } = req.body;

      // Crie um novo objeto Person com os dados da solicitação
      const newElemento = new Elemento({
        codigo,
        item,
        area,
      });

      // Salve no banco de dados
      await newElemento.save();

      res.status(201).json({ message: 'Elementos cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o elementos', error);
    res.status(500).json({ error: 'Erro ao cadastrar o elementos' });
  }
};
