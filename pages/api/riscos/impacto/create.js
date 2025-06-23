import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import ImpactoModel from '../../../../models/riscos/Impacto';

const { Impacto, ImpactoSchema } = ImpactoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(ImpactoSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Impacto(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Impacto cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Impacto', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Impacto' });
  }
};