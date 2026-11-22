import { createHash, timingSafeEqual } from 'node:crypto'

const digest = s => createHash('sha256').update(String(s)).digest()

// Compara em tempo constante; sem APP_PASSWORD configurada, ninguém entra.
export function senhaConfere(recebida, esperada) {
  if (!esperada || !recebida) return false
  return timingSafeEqual(digest(recebida), digest(esperada))
}

// shortcut: uma senha única para todo o app, trocar por login individual se houver vários facilitadores.
export function exigirSenha(req, res) {
  if (!process.env.APP_PASSWORD) {
    res.status(500).json({ error: 'APP_PASSWORD não configurada no servidor.' })
    return false
  }
  if (!senhaConfere(req.headers['x-app-password'], process.env.APP_PASSWORD)) {
    res.status(401).json({ error: 'Senha incorreta.' })
    return false
  }
  return true
}
