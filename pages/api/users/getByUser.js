import connectToDatabase from '../../../lib/db';
import UserModel from '../../../models/User';

const { User } = UserModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const { user } = req.query;
      const usuario = await User.find({ usuario: user });

      res.status(200).json({ usuario });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar elementos da WBS', error);
    res.status(500).json({ error: 'Erro ao buscar elementos da WBS' });
  }
};
