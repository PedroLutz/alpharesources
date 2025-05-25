import connectToDatabase from '../../../../lib/db';
import HabilidadeModel from '../../../../models/responsabilidade/Habilidade';

const { Habilidade, HabilidadeSchema } = HabilidadeModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(HabilidadeSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Habilidade(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Habilidade cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Habilidade', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Habilidade' });
  }
};
