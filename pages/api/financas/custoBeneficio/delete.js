import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import CustoBeneficioModel from '../../../../models/financas/CustoBeneficio';

const { CustoBeneficio } = CustoBeneficioModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'DELETE') {
      if (!req.query.id) {
        return res.status(400).json({ error: 'O ID do CustoBeneficio não foi fornecido' });
      }

      const deletedData = await CustoBeneficio.findByIdAndDelete(req.query.id);

      if (!deletedData) {
        return res.status(404).json({ error: 'CustoBeneficio não encontrado' });
      }

      res.status(200).json({ message: 'CustoBeneficio excluído com sucesso' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao excluir CustoBeneficio', error);
    res.status(500).json({ error: 'Erro ao excluir CustoBeneficio' });
  }
};