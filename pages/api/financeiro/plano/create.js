// pages/api/create.js
import connectToDatabase from '../../../../lib/db';
import Plano from '../../../../models/financeiro/Plano';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { plano, area, item, recurso, uso,  tipo_a, valor_a, plano_a, data_inicial, data_esperada, data_limite, plano_b, tipo_b, valor_b } = req.body;

      // Crie um novo objeto Person com os dados da solicitação
      const newPlano = new Plano({
        plano, 
        area,
        item, 
        recurso, 
        uso, 
        tipo_a, 
        valor_a, 
        plano_a, 
        data_inicial,
        data_esperada, 
        data_limite, 
        plano_b, 
        tipo_b, 
        valor_b
      });

      // Salve no banco de dados
      await newPlano.save();

      res.status(201).json({ message: 'Plano criado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao criar o plano', error);
    res.status(500).json({ error: 'Erro ao criar o plano' });
  }
};
