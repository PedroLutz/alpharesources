import connectToDatabase from '../../../../lib/db';
import InfoComunicadaModel from '../../../../models/comunicacao/InfoComunicada';

const { InfoComunicada } = InfoComunicadaModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const infoComunicada = await InfoComunicada.find().sort({ stakeholder: 1 });
  
        res.status(200).json({ infoComunicada });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os InfoComunicadas', error);
    res.status(500).json({ error: 'Erro ao buscar os InfoComunicadas' });
  }
};
