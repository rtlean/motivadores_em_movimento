async function call(url, opts = {}) {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (r.status === 204) return null
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Falha na comunicação com o servidor.')
  return data
}

export const listarParticipantes = () => call('/api/participantes')
export const criarParticipante = p => call('/api/participantes', { method: 'POST', body: JSON.stringify(p) })
export const editarParticipante = (id, p) => call(`/api/participantes?id=${id}`, { method: 'PUT', body: JSON.stringify(p) })
export const excluirParticipante = id => call(`/api/participantes?id=${id}`, { method: 'DELETE' })
export const listarResultados = () => call('/api/resultados')
export const salvarResultado = r => call('/api/resultados', { method: 'PUT', body: JSON.stringify(r) })
