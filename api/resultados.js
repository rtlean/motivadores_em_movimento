import { sql, fail, UUID } from './_db.js'
import { isPermutation, validImp, validFel } from '../src/logic.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.json(await sql`select participante_id, ordem, imp, fel, mudanca, updated_at from resultados`)
    }
    if (req.method === 'PUT') {
      const b = req.body || {}
      const mudanca = String(b.mudanca || '').trim()
      if (!UUID.test(b.participante_id || '')) return fail(res, 400, 'Participante inválido.')
      if (!isPermutation(b.ordem)) return fail(res, 400, 'Ordem dos motivadores inválida.')
      if (!validImp(b.imp)) return fail(res, 400, 'Impactos inválidos.')
      if (!validFel(b.fel)) return fail(res, 400, 'Notas do Radar da Felicidade inválidas.')
      if (mudanca.length > 200) return fail(res, 400, 'Mudança com no máximo 200 caracteres.')
      const [row] = await sql`
        insert into resultados (participante_id, ordem, imp, fel, mudanca, updated_at)
        values (${b.participante_id}, ${JSON.stringify(b.ordem)}::jsonb, ${JSON.stringify(b.imp)}::jsonb, ${JSON.stringify(b.fel)}::jsonb, ${mudanca}, now())
        on conflict (participante_id) do update
          set ordem = excluded.ordem, imp = excluded.imp, fel = excluded.fel, mudanca = excluded.mudanca, updated_at = now()
        returning participante_id, ordem, imp, fel, mudanca, updated_at`
      return res.json(row)
    }
    res.setHeader('Allow', 'GET, PUT')
    return fail(res, 405, 'Método não permitido.')
  } catch (e) {
    if (e.code === '23503') return fail(res, 404, 'Participante não encontrado.')
    console.error(e)
    return fail(res, 500, 'Erro ao acessar o banco de dados.')
  }
}
