import { sql, fail, UUID } from './_db.js'
import { TIMES, TEMPOS } from '../src/logic.js'

function parse(body) {
  const b = body || {}
  const nome = String(b.nome || '').trim()
  const funcao = String(b.funcao || '').trim()
  if (!nome || nome.length > 100) return { error: 'Informe um nome com até 100 caracteres.' }
  if (funcao.length > 100) return { error: 'Função com no máximo 100 caracteres.' }
  if (!TEMPOS.includes(b.tempo)) return { error: 'Tempo de empresa inválido.' }
  if (!TIMES.includes(b.time)) return { error: 'Time inválido.' }
  return { nome, funcao, tempo: b.tempo, time: b.time }
}

export default async function handler(req, res) {
  try {
    const id = req.query.id
    if (req.method === 'GET') {
      return res.json(await sql`select id, nome, funcao, tempo, time from participantes order by time, nome`)
    }
    if (req.method === 'DELETE') {
      if (!UUID.test(id || '')) return fail(res, 400, 'ID inválido.')
      await sql`delete from participantes where id = ${id}`
      return res.status(204).end()
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      const p = parse(req.body)
      if (p.error) return fail(res, 400, p.error)
      if (req.method === 'POST') {
        const [row] = await sql`insert into participantes (nome, funcao, tempo, time) values (${p.nome}, ${p.funcao}, ${p.tempo}, ${p.time}) returning id, nome, funcao, tempo, time`
        return res.status(201).json(row)
      }
      if (!UUID.test(id || '')) return fail(res, 400, 'ID inválido.')
      const [row] = await sql`update participantes set nome = ${p.nome}, funcao = ${p.funcao}, tempo = ${p.tempo}, time = ${p.time} where id = ${id} returning id, nome, funcao, tempo, time`
      return row ? res.json(row) : fail(res, 404, 'Participante não encontrado.')
    }
    res.setHeader('Allow', 'GET, POST, PUT, DELETE')
    return fail(res, 405, 'Método não permitido.')
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'Já existe um participante com esse nome.')
    console.error(e)
    return fail(res, 500, 'Erro ao acessar o banco de dados.')
  }
}
