import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { CHAVE_SENHA } from './api.js'
import './styles.css'

function Senha() {
  const [ok, setOk] = useState(() => !!localStorage.getItem(CHAVE_SENHA))
  const [valor, setValor] = useState('')
  const erro = sessionStorage.getItem('mm-senha-erro')
  if (ok) return <App />
  function entrar(e) {
    e.preventDefault()
    if (!valor) return
    localStorage.setItem(CHAVE_SENHA, valor)
    sessionStorage.removeItem('mm-senha-erro')
    setOk(true)
  }
  return (
    <div className="wrap">
      <h1>Motivadores em Movimento</h1>
      <form onSubmit={entrar} className="row">
        <label htmlFor="senha">Senha de acesso</label>
        <input id="senha" type="password" autoFocus autoComplete="current-password" value={valor} onChange={e => setValor(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
      {erro && <p className="alerta" role="alert">Senha incorreta. Tente de novo.</p>}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<Senha />)
