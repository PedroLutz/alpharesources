import connectToDatabase from '../../lib/db';
import UserModel from '../../models/User';
import bcrypt from "bcryptjs";
import { gerarToken } from '../../lib/jwt_auth';

const { User } = UserModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const {usuario, senha} = req.body;
      const user = await User.findOne({ usuario: usuario });

      if(!user){
        res.status(200).json({ achou: false });
        return;
      }
      
      const isSenhaCorreta = await bcrypt.compare(senha, user.senha);
      if(!isSenhaCorreta){
        res.status(200).json({ achou: true, acertou: false });
      } else {
        const token = gerarToken({ id: user._id, usuario: user.usuario, admin: user.admin });
        res.status(200).json({ achou: true, acertou: true, token });
      }
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar elementos da WBS', error);
    res.status(500).json({ error: 'Erro ao buscar elementos da WBS' });
  }
};
