import { test } from 'node:test'
import assert from 'node:assert/strict'
import { senhaConfere } from './_auth.js'

test('senhaConfere aceita só a senha exata e falha fechado sem senha configurada', () => {
  assert.equal(senhaConfere('segredo', 'segredo'), true)
  assert.equal(senhaConfere('errada', 'segredo'), false)
  assert.equal(senhaConfere('', 'segredo'), false)
  assert.equal(senhaConfere(undefined, 'segredo'), false)
  assert.equal(senhaConfere('segredo', undefined), false)
  assert.equal(senhaConfere('', ''), false)
})
