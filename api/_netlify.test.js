import { test } from 'node:test'
import assert from 'node:assert/strict'
import { adapt } from './_netlify.js'

test('adapt repassa query, cabeçalhos e corpo, e devolve status e JSON', async () => {
  const fn = adapt((req, res) => res.status(201).json({ id: req.query.id, senha: req.headers['x-app-password'], nome: req.body.nome }))
  const r = await fn(new Request('http://x/api/p?id=7', { method: 'POST', headers: { 'X-App-Password': 's' }, body: '{"nome":"Ana"}' }))
  assert.equal(r.status, 201)
  assert.deepEqual(await r.json(), { id: '7', senha: 's', nome: 'Ana' })
})

test('adapt devolve 204 sem corpo e 400 para JSON inválido', async () => {
  const vazio = await adapt((req, res) => res.status(204).end())(new Request('http://x/', { method: 'DELETE' }))
  assert.equal(vazio.status, 204)
  assert.equal(await vazio.text(), '')
  const ruim = await adapt(() => assert.fail('não deveria chamar'))(new Request('http://x/', { method: 'PUT', body: '{' }))
  assert.equal(ruim.status, 400)
})
