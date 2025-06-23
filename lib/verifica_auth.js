import cookie from 'cookie';
import { verificarToken } from './jwt_auth';

export function verificarAuth(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth; // assume que o cookie se chama 'auth'

  if (!token) return null;

  return verificarToken(token); // retorna o payload se válido, ou null se inválido
}