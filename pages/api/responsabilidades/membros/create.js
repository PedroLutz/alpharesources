// pages/api/create.js
import connectToDatabase from '../../../../lib/db';
import Membro from '../../../../models/responsabilidade/Membro';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { nome, softskills, hardskills } = req.body;

      // Crie um novo objeto Person com os dados da solicitação
      const newMembro = new Membro({
        nome,
        softskills,
        hardskills
      });

      // Salve no banco de dados
      await newMembro.save();

      res.status(201).json({ message: 'Membro cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o membro', error);
    res.status(500).json({ error: 'Erro ao cadastrar o membro' });
  }
};
