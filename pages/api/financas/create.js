import connectToDatabase from '../../../lib/db';
import LancamentoModel from '../../../models/LancamentoFinanceiro';

const { Lancamento, LancamentoSchema } = LancamentoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(LancamentoSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Lancamento(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Lancamento cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Lancamento', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Lancamento' });
  }
};
