import connectToDatabase from '../../../../lib/db';
import RespostaModel from '../../../../models/riscos/Resposta';

const { Resposta, RespostaSchema } = RespostaModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(RespostaSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Resposta(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Resposta cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Resposta', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Resposta' });
  }
};
