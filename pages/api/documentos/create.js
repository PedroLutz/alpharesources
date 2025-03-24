import connectToDatabase from '../../../lib/db';
import ProjectCharterModel from '../../../models/documentos/ProjectCharter';

const { ProjectCharter, ProjectCharterSchema } = ProjectCharterModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(ProjectCharterSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new ProjectCharter(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'ProjectCharter cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o ProjectCharter', error);
    res.status(500).json({ error: 'Erro ao cadastrar o ProjectCharter' });
  }
};
