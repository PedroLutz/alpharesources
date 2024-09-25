import connectToDatabase from '../../../lib/db';
import InfoComunicadaModel from '../../../models/comunicacao/InfoComunicada';

const { InfoComunicada, InfoComunicadaSchema } = InfoComunicadaModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'O ID do InfoComunicada é obrigatório para a atualização.' });
      }

      const propriedadesNomes = Object.keys(InfoComunicadaSchema.paths);
      const updateFields = {};
      
      for (const key in req.body) {
        if (req.body[key] != null) {
          if (propriedadesNomes.includes(key)) {
            updateFields[key] = req.body[key];
          } else {
            return res.status(400).json({ error: 'Os campos fornecidos não são compatíveis com o do modelo!' });
          }
        }
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para a atualização.' });
      }


      const updatedData = await InfoComunicada.findByIdAndUpdate(id, updateFields, { new: true });

      if (!updatedData) {
        return res.status(404).json({ error: 'InfoComunicada não encontrado.' });
      }

      return res.status(200).json(updatedData);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar o InfoComunicada', error);
    res.status(500).json({ error: 'Erro ao atualizar o InfoComunicada' });
  }
};