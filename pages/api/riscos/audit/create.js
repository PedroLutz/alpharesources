import connectToDatabase from '../../../../lib/db';
import AuditModel from '../../../../models/riscos/Audit';

const { Audit, AuditSchema } = AuditModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(AuditSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Audit(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Audit cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Audit', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Audit' });
  }
};
