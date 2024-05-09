import connectToDatabase from '../../../lib/db';
import MembroModel from '../../../../models/responsabilidade/Membro';

const { Membro, MembroSchema } = MembroModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(MembroSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Membro(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Membro cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Membro', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Membro' });
  }
};
