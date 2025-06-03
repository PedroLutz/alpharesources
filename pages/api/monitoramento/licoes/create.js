import connectToDatabase from '../../../../lib/db';
import LicaoModel from '../../../../models/monitoramento/Licao';

const { Licao, LicaoSchema } = LicaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(LicaoSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Licao(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Licao cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Licao', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Licao' });
  }
};
