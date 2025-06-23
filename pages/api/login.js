import connectToDatabase from '../../lib/db';
import UserModel from '../../models/User';
import bcrypt from "bcryptjs";
import { gerarToken } from '../../lib/jwt_auth';
import cookie from 'cookie';

const { User } = UserModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { usuario, senha } = req.body;
      const user = await User.findOne({ usuario });

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const isSenhaCorreta = await bcrypt.compare(senha, user.senha);
      if (!isSenhaCorreta) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      const token = gerarToken({ id: user._id, usuario: user.usuario, admin: user.admin });

      // seta o cookie httpOnly
      res.setHeader('Set-Cookie', cookie.serialize('auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1h
        sameSite: 'strict',
        path: '/',
      }));

      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
