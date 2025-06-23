// pages/api/verificar.js
import { verificarToken } from '../../lib/jwt_auth';
import cookie from 'cookie';

export default function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth;

  if (!token) return res.status(401).json({ autenticado: false });

  const payload = verificarToken(token);
  if (!payload) return res.status(401).json({ autenticado: false });

  return res.status(200).json({ autenticado: true, admin: payload.admin });
}
