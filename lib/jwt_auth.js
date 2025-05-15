import jwt from 'jsonwebtoken';

const segredo = process.env.JWT_SECRET;

export function gerarToken(payload) {
  return jwt.sign(payload, segredo, { expiresIn: '1h' });
}

export function verificarToken(token) {
  try {
    return jwt.verify(token, segredo);
  } catch (err) {
    return null;
  }
}