import connectToDatabase from '../../../../lib/db';
import PlanoAquisicaoModel from '../../../../models/recursos/PlanoAquisicao';

const { PlanoAquisicao, PlanoAquisicaoSchema } = PlanoAquisicaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(PlanoAquisicaoSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new PlanoAquisicao(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'PlanoAquisicao cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o PlanoAquisicao', error);
    res.status(500).json({ error: 'Erro ao cadastrar o PlanoAquisicao' });
  }
};
