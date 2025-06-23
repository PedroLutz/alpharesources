import connectToDatabase from '../../../../lib/db';
import EngajamentoModel from '../../../../models/comunicacao/Engajamento';
import { verificarAuth } from '../../../../lib/verifica_auth';

const { Engajamento, EngajamentoSchema } = EngajamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(EngajamentoSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Engajamento(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Engajamento cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Engajamento', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Engajamento' });
  }
};