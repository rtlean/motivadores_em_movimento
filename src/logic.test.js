import { test } from 'node:test'
import assert from 'node:assert/strict'
import { IDS, saldo, alerta, isPermutation, validImp, validFel, points } from './logic.js'

test('saldo pondera pela importância', () => {
  assert.equal(saldo(IDS, { [IDS[0]]: 1, [IDS[9]]: -1 }), 10 - 1)
})

test('alerta quando top 3 cai ou bottom 3 sobe', () => {
  assert.equal(alerta(IDS, { [IDS[1]]: -1 }), true)
  assert.equal(alerta(IDS, { [IDS[9]]: 1 }), true)
  assert.equal(alerta(IDS, { [IDS[5]]: -1 }), false)
})

test('validações das entradas da API', () => {
  assert.equal(isPermutation(IDS.slice().reverse()), true)
  assert.equal(isPermutation(IDS.slice(1)), false)
  assert.equal(validImp({ status: 1, meta: -1 }), true)
  assert.equal(validImp({ status: 2 }), false)
  assert.equal(validFel({ eu: 4 }), true)
  assert.equal(validFel({ eu: 5 }), false)
})

test('pontos do radar', () => {
  assert.equal(points(100, 50, 1, [1, 1, 1, 1]), '100.0,50.0 150.0,100.0 100.0,150.0 50.0,100.0')
})
