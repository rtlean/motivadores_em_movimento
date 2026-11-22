import { useEffect, useState } from 'react'
import * as L from './logic.js'
import * as api from './api.js'

const TABS = [['intro', 'Como jogar'], ['cadastro', 'Participantes'], ['ordenar', '1. Ordenar'], ['mudanca', '2. Mudança'], ['resultado', '3. Resultado'], ['time', '4. Time'], ['feliz', '5. Radar da Felicidade']]
const FORM0 = { nome: '', funcao: '', tempo: L.TEMPOS[0], time: L.TIMES[0] }
const PAINEIS = [['seal', 'Seal Team'], ['fenix', 'Fênix Team'], ['todos', 'Compilado dos times']]
const FCOR = ['#B3261E', '#A0561A', '#C9A400', '#3FA34D']
const fmt = x => (x == null ? '—' : x.toFixed(1))
const chip = m => ({ background: m.cor, color: m.claro ? '#1B2430' : '#FFFFFF' })

export default function App() {
  const [tela, setTela] = useState('intro')
  const [cad, setCad] = useState([])
  const [res, setRes] = useState({}) // participante_id -> resultado salvo
  const [erroGeral, setErroGeral] = useState('')
  const [cadSel, setCadSel] = useState('')
  const [ordem, setOrdem] = useState(L.IDS)
  const [imp, setImp] = useState({})
  const [fel, setFel] = useState({})
  const [mudancaSel, setMudancaSel] = useState(L.OPC[0])
  const [mudancaTxt, setMudancaTxt] = useState('')
  const [msg, setMsg] = useState('')
  const [painel, setPainel] = useState('todos')
  const [felView, setFelView] = useState('pessoa')
  const [form, setForm] = useState(FORM0)
  const [editId, setEditId] = useState(null)
  const [delId, setDelId] = useState(null)
  const [cadErro, setCadErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    Promise.all([api.listarParticipantes(), api.listarResultados()])
      .then(([ps, rs]) => { setCad(ps); setRes(Object.fromEntries(rs.map(r => [r.participante_id, r]))) })
      .catch(e => setErroGeral(e.message))
  }, [])

  const pessoa = cad.find(c => c.id === cadSel)
  const mudanca = mudancaSel === L.OUTRA ? mudancaTxt.trim() : mudancaSel

  function carregar(id) {
    const r = res[id]
    setCadSel(id); setMsg('')
    setOrdem(r ? r.ordem : L.IDS); setImp(r ? r.imp : {}); setFel(r ? r.fel : {})
    if (r && r.mudanca) {
      if (L.OPC.includes(r.mudanca)) { setMudancaSel(r.mudanca); setMudancaTxt('') } else { setMudancaSel(L.OUTRA); setMudancaTxt(r.mudanca) }
    }
  }

  async function salvar() {
    if (!pessoa) { setMsg('Selecione um participante cadastrado.'); return }
    setSalvando(true)
    try {
      const r = await api.salvarResultado({ participante_id: pessoa.id, ordem, imp, fel, mudanca })
      setRes({ ...res, [pessoa.id]: r }); setMsg(`${pessoa.nome} salvo no ${pessoa.time}.`)
    } catch (e) { setMsg(e.message) } finally { setSalvando(false) }
  }

  async function salvarCad() {
    const f = { ...form, nome: form.nome.trim(), funcao: form.funcao.trim() }
    if (!f.nome) { setCadErro('Informe o nome.'); return }
    try {
      if (editId) {
        const row = await api.editarParticipante(editId, f)
        setCad(cad.map(c => (c.id === editId ? row : c)))
      } else {
        setCad([...cad, await api.criarParticipante(f)])
      }
      setForm(FORM0); setEditId(null); setCadErro('')
    } catch (e) { setCadErro(e.message) }
  }

  async function excluir(c) {
    if (delId !== c.id) { setDelId(c.id); return } // two-step confirm
    try {
      await api.excluirParticipante(c.id)
      setCad(cad.filter(x => x.id !== c.id))
      const { [c.id]: _, ...resto } = res; setRes(resto)
      if (cadSel === c.id) setCadSel('')
      if (editId === c.id) { setEditId(null); setForm(FORM0) }
      setDelId(null)
    } catch (e) { setCadErro(e.message) }
  }

  const mover = (i, d) => { const j = i + d; if (j < 0 || j >= ordem.length) return; const o = ordem.slice(); [o[i], o[j]] = [o[j], o[i]]; setOrdem(o) }
  const embaralhar = () => { const o = ordem.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]] } setOrdem(o) }

  // saved results joined with the participant's current cadastro
  const salvos = cad.filter(c => res[c.id]).map(c => ({ ...c, ...res[c.id] }))
  const doPainel = k => (k === 'todos' ? salvos : salvos.filter(s => s.time === (k === 'seal' ? L.TIMES[0] : L.TIMES[1])))
  const mediaPos = (lista, id) => L.media(lista.map(s => s.ordem.indexOf(id)))
  const felDe = lista => Object.fromEntries(L.FEL.map(f => [f.k, L.media(lista.map(s => s.fel[f.k]).filter(Boolean))]))

  const saldo = L.saldo(ordem, imp)
  const nCima = Object.values(imp).filter(v => v === 1).length
  const nBaixo = Object.values(imp).filter(v => v === -1).length
  const alerta = L.alerta(ordem, imp)
  const saldoCor = saldo > 0 ? '#1F7A3A' : saldo < 0 ? '#B3261E' : '#5B6878'
  const saldoTxt = saldo > 0 ? 'a mudança tende a motivar' : saldo < 0 ? 'a mudança tende a desmotivar' : 'impacto neutro'

  const Seletor = ({ id, onChange }) => (
    <div className="row">
      <label htmlFor={id} className="lbl">Participante</label>
      <select id={id} value={cadSel} onChange={e => onChange(e.target.value)} className="field" style={{ minWidth: 240 }}>
        <option value="">Selecione um participante</option>
        {cad.map(c => <option key={c.id} value={c.id}>{c.nome} · {c.time}</option>)}
      </select>
    </div>
  )

  const Resumo = () => (
    <div className="box">
      <span className="kicker">Mudança avaliada</span>
      <strong>{mudanca || 'Outra (não descrita)'}</strong>
      <span>Cartas para cima: {nCima} · para baixo: {nBaixo}</span>
      <span style={{ fontWeight: 600, color: saldoCor }}>Saldo ponderado pela importância: {saldo > 0 ? '+' : ''}{saldo} · {saldoTxt}</span>
      {alerta && <span className="alerta">Atenção: um motivador importante cai ou um pouco importante sobe. Hora de refletir.</span>}
    </div>
  )

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>Motivadores em Movimento</h1>
          <p className="muted">Jogo de Gestão 3.0 · descubra o que move você e o seu time</p>
        </div>
        <Seletor id="cadTop" onChange={carregar} />
      </header>

      {erroGeral && <p className="alerta" role="alert">Não foi possível carregar os dados: {erroGeral}</p>}

      <nav aria-label="Etapas" className="row">
        {TABS.map(([k, label]) => <button key={k} className={tela === k ? 'tab on' : 'tab'} onClick={() => setTela(k)}>{label}</button>)}
      </nav>

      {tela === 'intro' && (
        <section className="card">
          <div className="row" style={{ gap: 24 }}>
            <img src="/img/pessoas.png" alt="Duas pessoas sorrindo abraçadas" style={{ width: 200 }} />
            <div className="col" style={{ flex: '1 1 400px' }}>
              <h2>O que move você?</h2>
              <p>O que você faz quando precisa tomar uma decisão? Como saber o que motiva um novo colega? Criado por Jurgen Appelo, fundador do Management 3.0, o Moving Motivators ajuda a refletir sobre a motivação e como ela é afetada pela mudança organizacional.</p>
              <p>São 10 motivadores, os <strong>CHAMPFROGS</strong>, derivados das obras de Daniel Pink, Steven Reiss e Edward Deci. Antes de começar, combinem o que cada palavra significa para vocês.</p>
              <button className="primary" style={{ alignSelf: 'flex-start' }} onClick={() => setTela('cadastro')}>Começar</button>
            </div>
          </div>
          <div className="grid">
            <div className="box blue"><h3>Motivação intrínseca</h3><p>O desejo inato de se sair bem, com autocontrole e autodireção na conquista de objetivos. Resulta da satisfação de desejos básicos.</p></div>
            <div className="box orange"><h3>Motivação extrínseca</h3><p>Recompensas externas, como pagamentos, bônus ou promoções.</p></div>
          </div>
          <div className="grid">
            <div className="box line"><h3>1. Ordene</h3><p>Coloque as cartas da esquerda (menos importante) para a direita (mais importante).</p></div>
            <div className="box line"><h3>2. Avalie a mudança</h3><p>Mova cada carta para cima (efeito positivo) ou para baixo (negativo) e veja se há mais cartas para cima ou para baixo.</p></div>
            <div className="box line"><h3>3. Reflita e converse</h3><p>Compartilhe com o time. Se os seus motivadores mais importantes caem ou os menos importantes sobem, é hora de refletir.</p></div>
          </div>
          <div className="box"><h3>Dicas antes de jogar</h3><ul><li>Reserve sempre um tempo para conversar depois: é aí que está o valor.</li><li>Deixe as pessoas pensarem em voz alta.</li><li>Primeiro, cheguem a um consenso sobre as palavras.</li><li>Funciona em sessões 1:1, com o time inteiro e em retrospectivas.</li></ul></div>
        </section>
      )}

      {tela === 'cadastro' && (
        <section className="card">
          <div className="row" style={{ gap: 16 }}>
            <img src="/img/menino.png" alt="Participante sorrindo" style={{ width: 110 }} />
            <div style={{ flex: '1 1 300px' }}>
              <h2>Cadastro de participantes</h2>
              <p className="muted">Cadastre as pessoas dos times antes de jogar. Depois, escolha o participante no topo da tela.</p>
            </div>
          </div>
          <div className="form">
            <div className="col"><label htmlFor="fNome" className="lbl">Nome *</label><input id="fNome" className="field" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} maxLength={100} /></div>
            <div className="col"><label htmlFor="fFuncao" className="lbl">Função</label><input id="fFuncao" className="field" value={form.funcao} placeholder="Ex.: Desenvolvedor" onChange={e => setForm({ ...form, funcao: e.target.value })} maxLength={100} /></div>
            <div className="col"><label htmlFor="fTempo" className="lbl">Tempo de empresa</label><select id="fTempo" className="field" value={form.tempo} onChange={e => setForm({ ...form, tempo: e.target.value })}>{L.TEMPOS.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="col"><label htmlFor="fTime" className="lbl">Time</label><select id="fTime" className="field" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}>{L.TIMES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="row">
              <button type="button" className="primary" style={{ flex: 1 }} onClick={salvarCad}>{editId ? 'Salvar alterações' : 'Cadastrar'}</button>
              {editId && <button type="button" className="ghost" onClick={() => { setForm(FORM0); setEditId(null); setCadErro('') }}>Cancelar</button>}
            </div>
          </div>
          {cadErro && <p className="alerta" role="alert">{cadErro}</p>}
          <div className="scroll">
            <table>
              <thead><tr><th>Nome</th><th>Função</th><th>Tempo de empresa</th><th>Time</th><th>Ações</th></tr></thead>
              <tbody>
                {cad.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.nome}</strong></td><td>{c.funcao || '—'}</td><td>{c.tempo}</td><td>{c.time}</td>
                    <td><div className="row">
                      <button className="ghost blue" onClick={() => { setForm({ nome: c.nome, funcao: c.funcao, tempo: c.tempo, time: c.time }); setEditId(c.id); setDelId(null); setCadErro('') }}>Editar</button>
                      <button className={delId === c.id ? 'danger on' : 'danger'} onClick={() => excluir(c)}>{delId === c.id ? 'Confirmar exclusão' : 'Excluir'}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">{cad.length ? `${cad.length} participantes cadastrados.` : 'Nenhum participante cadastrado ainda.'}</p>
        </section>
      )}

      {tela === 'ordenar' && (
        <section className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="row"><img src="/img/sapo.png" alt="Sapo verde" style={{ width: 72 }} /><h2>1. Ordene seus motivadores</h2></div>
              <p className="muted">Da esquerda (menos importante) para a direita (mais importante). Use as setas para mover.</p>
              <Seletor id="cadOrd" onChange={carregar} />
            </div>
            <button className="ghost" onClick={embaralhar}>Embaralhar</button>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', fontWeight: 600, color: '#0B6E99', fontSize: 13 }}><span>◀ menos importante</span><span>mais importante ▶</span></div>
          <div className="cards">
            {ordem.map((id, i) => ({ id, i })).reverse().map(({ id, i }) => {
              const m = L.byId(id)
              return (
                <article key={id} className="mcard">
                  <div className="mhead" style={chip(m)}><span>{i + 1}º</span><span>{m.nome}</span></div>
                  <p>{m.frase}</p>
                  <div className="row" style={{ padding: '0 12px 12px' }}>
                    <button className="arrow" aria-label={`Mover ${m.nome} para menos importante`} onClick={() => mover(i, 1)}>◀</button>
                    <button className="arrow" aria-label={`Mover ${m.nome} para mais importante`} onClick={() => mover(i, -1)}>▶</button>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button className="primary" onClick={() => setTela('mudanca')}>Próximo: avaliar a mudança</button></div>
        </section>
      )}

      {tela === 'mudanca' && (
        <section className="card">
          <div className="row"><img src="/img/globo.png" alt="Globo com setas de mudança" style={{ width: 56 }} /><h2>2. Impacto da mudança</h2></div>
          <label htmlFor="mudanca" className="muted">Escolha a mudança em discussão</label>
          <select id="mudanca" className="field" value={mudancaSel} onChange={e => setMudancaSel(e.target.value)}>{L.OPC.map(o => <option key={o}>{o}</option>)}</select>
          {mudancaSel === L.OUTRA && <>
            <label htmlFor="mudancaTxt" className="muted">Descreva a mudança</label>
            <input id="mudancaTxt" className="field" value={mudancaTxt} maxLength={200} placeholder="Ex.: fusão de squads" onChange={e => setMudancaTxt(e.target.value)} />
          </>}
          <p className="muted">Para cada motivador: a mudança o fortalece (▲), não afeta (—) ou enfraquece (▼)?</p>
          <div className="col">
            {ordem.map((id, i) => {
              const m = L.byId(id), v = imp[id] || 0
              const b = (val, txt, label, cor) => (
                <button aria-label={label} aria-pressed={v === val} className="imp" style={v === val ? { background: cor, borderColor: cor, color: '#FFFFFF' } : null} onClick={() => setImp({ ...imp, [id]: val })}>{txt}</button>
              )
              return (
                <div key={id} className="linha">
                  <span className="chip" style={chip(m)}>{i + 1}º {m.nome}</span>
                  <span className="muted" style={{ flex: '1 1 200px' }}>{m.frase}</span>
                  <div className="row">{b(1, '▲', 'Fortalece', '#1F7A3A')}{b(0, '—', 'Neutro', '#5B6878')}{b(-1, '▼', 'Enfraquece', '#B3261E')}</div>
                </div>
              )
            })}
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <Resumo />
            <button className="primary" onClick={() => setTela('resultado')}>Ver meu resultado</button>
          </div>
        </section>
      )}

      {tela === 'resultado' && (() => {
        const meuTime = pessoa ? salvos.filter(s => s.time === pessoa.time) : []
        const vHoje = L.AXES.map(id => 10 - ordem.indexOf(id))
        const vDepois = L.AXES.map((id, i) => Math.max(0, Math.min(11, vHoje[i] + (imp[id] || 0))))
        const vTime = meuTime.length ? L.AXES.map(id => 10 - mediaPos(meuTime, id)) : null
        return (
          <section className="card row" style={{ alignItems: 'flex-start', gap: 24 }}>
            <div className="col" style={{ flex: '1 1 380px', alignItems: 'center' }}>
              <h2 style={{ alignSelf: 'flex-start' }}>3. Radar dos motivadores</h2>
              <svg viewBox="0 0 440 440" role="img" aria-label="Radar de importância dos dez motivadores" style={{ width: '100%', maxWidth: 440 }}>
                {[32, 64, 96, 128, 160].map((r, i) => <circle key={r} cx="220" cy="220" r={r} fill="none" strokeWidth="2" stroke={['#3FA34D', '#7B4FC9', '#2E9BD6', '#E58A33', '#D9534F'][i]} />)}
                {L.AXES.map((id, i) => { const a = L.ang(i, 10), e = L.pt(220, 160, a), l = L.pt(220, 190, a); return <g key={id}><line x1="220" y1="220" x2={e[0]} y2={e[1]} stroke="#C5CED8" /><text x={l[0]} y={l[1] + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1B2430">{L.byId(id).nome.toUpperCase()}</text></g> })}
                {vTime && <polygon points={L.points(220, 160, 10, vTime)} fill="rgba(234,130,40,0.15)" stroke="#C2610F" strokeWidth="2" strokeDasharray="5 4" />}
                <polygon points={L.points(220, 160, 10, vHoje)} fill="rgba(11,110,153,0.25)" stroke="#0B6E99" strokeWidth="2.5" />
                <polygon points={L.points(220, 160, 10, vDepois)} fill="none" stroke="#1F7A3A" strokeWidth="2.5" strokeDasharray="2 4" />
              </svg>
              <p className="muted">Azul: {pessoa ? pessoa.nome : 'você'} hoje · pontilhado verde: após a mudança · tracejado laranja: média do {pessoa ? pessoa.time : 'time'} ({meuTime.length} participantes)</p>
            </div>
            <div className="col" style={{ flex: '1 1 340px' }}>
              <Resumo />
              <h3>Seus 3 principais motivadores</h3>
              {ordem.slice(0, 3).map((id, i) => { const m = L.byId(id), v = imp[id] || 0; return (
                <div key={id} className="box line">
                  <span className="chip" style={chip(m)}>{i + 1}º {m.nome}</span>
                  <span>{m.desc}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: v === 1 ? '#1F7A3A' : v === -1 ? '#B3261E' : '#5B6878' }}>Mudança: {v === 1 ? 'fortalece' : v === -1 ? 'enfraquece' : 'neutra'}</span>
                </div>) })}
              <button className="primary" disabled={salvando} onClick={salvar}>{salvando ? 'Salvando…' : 'Salvar participante no time'}</button>
              <p className="muted" role="status">{msg}</p>
            </div>
          </section>
        )
      })()}

      {tela === 'time' && (() => {
        const pf = doPainel(painel)
        const linhas = L.MM.map(m => { const md = mediaPos(pf, m.id); return { m, votos: pf.filter(s => s.ordem.indexOf(m.id) < 3).length, md } })
          .sort((a, b) => b.votos - a.votos || (a.md ?? 99) - (b.md ?? 99))
        return (
          <section className="card">
            <h2>4. Painel dos times</h2>
            <div className="row">{PAINEIS.map(([k, l]) => <button key={k} className={painel === k ? 'tab on' : 'tab'} onClick={() => setPainel(k)}>{l}</button>)}</div>
            <p className="muted">{PAINEIS.find(p => p[0] === painel)[1]}: {pf.length} participantes. Votação = quantas pessoas colocaram o motivador no top 3. Posição média: 1 = mais importante.</p>
            <div className="scroll">
              <table>
                <thead><tr className="orange"><th>Motivador</th><th>Votação</th><th>Posição média</th><th>Como usar na gestão do time</th></tr></thead>
                <tbody>{linhas.map(({ m, votos, md }) => <tr key={m.id}><td><span className="chip" style={chip(m)}>{m.nome}</span></td><td><strong>{votos}</strong></td><td>{md == null ? '—' : (md + 1).toFixed(1)}</td><td>{m.desc}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="row">{pf.map(s => <span key={s.id} className="pill">{s.nome} ({s.time}) · top: {s.ordem.slice(0, 3).map(id => L.byId(id).nome).join(', ')}</span>)}</div>
          </section>
        )
      })()}

      {tela === 'feliz' && (() => {
        const fsel = felView === 'pessoa' ? fel : felDe(doPainel(felView))
        const fv = L.FEL.map(f => fsel[f.k] || 0)
        const fn = fv.filter(Boolean)
        const fSeal = felDe(doPainel('seal')), fFenix = felDe(doPainel('fenix')), fTodos = felDe(salvos)
        const titulo = felView === 'pessoa' ? (pessoa ? pessoa.nome : 'Selecione um participante') : PAINEIS.find(p => p[0] === felView)[1]
        return (<>
          <section className="card row" style={{ alignItems: 'flex-start', gap: 24 }}>
            <div className="col" style={{ flex: '1 1 420px' }}>
              <h2>5. Radar da Felicidade</h2>
              <p className="muted">O quão satisfeito você está? 1 = insatisfeito · 4 = muito satisfeito</p>
              <Seletor id="cadFel" onChange={id => { carregar(id); setFelView('pessoa') }} />
              {L.FEL.map(f => (
                <div key={f.k} className="linha" style={{ border: 'none', borderBottom: '1px solid #EEF1F4', borderRadius: 0 }}>
                  <div className="col" style={{ flex: '1 1 220px', gap: 0 }}><span className="kicker">{f.grupo}</span><span>{f.pergunta}</span></div>
                  <div className="row">{[1, 2, 3, 4].map(n => (
                    <button key={n} aria-label={`${f.rotulo}: nota ${n}`} aria-pressed={fel[f.k] === n} className="imp"
                      style={{ borderWidth: 2, borderColor: FCOR[n - 1], fontWeight: 700, ...(fel[f.k] === n ? { background: FCOR[n - 1], color: '#FFFFFF' } : {}) }}
                      onClick={() => setFel({ ...fel, [f.k]: n })}>{n}</button>))}</div>
                </div>
              ))}
            </div>
            <div className="col" style={{ flex: '1 1 320px', alignItems: 'center' }}>
              <div className="row" style={{ justifyContent: 'center' }}>{[['pessoa', 'Participante'], ...PAINEIS.map(([k, l]) => [k, k === 'todos' ? 'Compilado' : l])].map(([k, l]) => <button key={k} className={felView === k ? 'tab on' : 'tab'} onClick={() => setFelView(k)}>{l}</button>)}</div>
              <strong>{titulo}</strong>
              <svg viewBox="0 0 360 360" role="img" aria-label={`Hexágono do Radar da Felicidade: ${titulo}`} style={{ width: '100%', maxWidth: 360 }}>
                {[1, 2, 3, 4].map(k => <polygon key={k} points={L.points(180, 130, 4, [k, k, k, k, k, k])} fill="none" stroke="#C5CED8" strokeDasharray="3 3" />)}
                {L.FEL.map((f, i) => { const a = L.ang(i, 6), e = L.pt(180, 130, a), l = L.pt(180, 155, a); return <g key={f.k}><line x1="180" y1="180" x2={e[0]} y2={e[1]} stroke="#3FA34D" /><text x={l[0]} y={l[1] + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1B2430">{f.nome}</text></g> })}
                <polygon points={L.points(180, 130, 4, fv)} fill="rgba(11,165,224,0.3)" stroke="#0B6E99" strokeWidth="2.5" />
              </svg>
              <strong>Média: {fn.length ? fmt(L.media(fn)) : '—'} / 4</strong>
              <div className="scroll" style={{ width: '100%' }}>
                <table>
                  <thead><tr><th>Dimensão</th><th>Seal</th><th>Fênix</th><th>Compilado</th></tr></thead>
                  <tbody>{L.FEL.map(f => <tr key={f.k}><td>{f.rotulo}</td><td>{fmt(fSeal[f.k])}</td><td>{fmt(fFenix[f.k])}</td><td><strong>{fmt(fTodos[f.k])}</strong></td></tr>)}</tbody>
                </table>
              </div>
              <button className="primary" disabled={salvando} onClick={salvar}>{salvando ? 'Salvando…' : 'Salvar participante no time'}</button>
              {felView === 'pessoa' && <p className="muted" role="status">{msg}</p>}
            </div>
          </section>
          <section className="card">
            <h2>Notas individuais por time</h2>
            <p className="muted">Todos os participantes cadastrados com as notas salvas do Radar da Felicidade (1 a 4).</p>
            {L.TIMES.map(tm => {
              const cs = cad.filter(c => c.time === tm), nSalvos = cs.filter(c => res[c.id]).length
              return (
                <div key={tm} className="col">
                  <h3 style={{ color: '#0B4F6C' }}>{tm} · {cs.length ? `${nSalvos} de ${cs.length} salvos` : 'nenhum participante cadastrado'}</h3>
                  <div className="scroll">
                    <table style={{ minWidth: 900 }}>
                      <thead><tr><th>Nome</th><th>Função</th><th>Tempo de empresa</th>{L.FEL.map(f => <th key={f.k}>{f.rotulo}</th>)}<th>Média</th><th>Situação</th></tr></thead>
                      <tbody>{cs.map(c => { const f = res[c.id] ? res[c.id].fel : {}, ns = L.FEL.map(d => f[d.k]).filter(Boolean); return (
                        <tr key={c.id}><td><strong>{c.nome}</strong></td><td>{c.funcao || '—'}</td><td>{c.tempo}</td>{L.FEL.map(d => <td key={d.k}>{f[d.k] || '—'}</td>)}<td><strong>{ns.length ? fmt(L.media(ns)) : '—'}</strong></td>
                          <td style={{ fontWeight: 600, color: res[c.id] ? '#1F7A3A' : '#8A5A00' }}>{res[c.id] ? 'Salvo' : 'Pendente'}</td></tr>) })}</tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </section>
        </>)
      })()}
    </div>
  )
}
