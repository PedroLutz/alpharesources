import connectToDatabase from '../../../lib/db';
import InfoComunicadaModel from '../../../models/comunicacao/InfoComunicada';

const { InfoComunicada, InfoComunicadaSchema } = InfoComunicadaModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(InfoComunicadaSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new InfoComunicada(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'InfoComunicada cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o InfoComunicada', error);
    res.status(500).json({ error: 'Erro ao cadastrar o InfoComunicada' });
  }
};
