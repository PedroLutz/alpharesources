import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import CustoBeneficioModel from '../../../../../models/financas/CustoBeneficio';

const { CustoBeneficio } = CustoBeneficioModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const custoBeneficios = await CustoBeneficio.find();


      res.status(200).json({ custoBeneficios });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os CustoBeneficios', error);
    res.status(500).json({ error: 'Erro ao buscar os CustoBeneficios' });
  }
};