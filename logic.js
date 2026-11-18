// Shared by the React app and the /api functions (validation).
export const MM = [
  { id: 'status', nome: 'Status', cor: '#E5799B', claro: true, frase: 'Minha posição é boa e reconhecida pelas pessoas que trabalham comigo.', desc: 'O reconhecimento da posição ocupada e o prestígio alcançado são fundamentais para a motivação.' },
  { id: 'poder', nome: 'Poder', cor: '#A3A83C', claro: true, frase: 'Há espaço suficiente para que eu influencie o que acontece ao meu redor.', desc: 'Gostam de ser ouvidos e envolvidos nas decisões; sua opinião precisa ter relevância.' },
  { id: 'relacao', nome: 'Relação', cor: '#3E9E5E', frase: 'Tenho bons contatos sociais com as pessoas no meu trabalho.', desc: 'Bom relacionamento é essencial: crie encontros para socializar (almoços, happy hours).' },
  { id: 'aceitacao', nome: 'Aceitação', cor: '#D9D332', claro: true, frase: 'As pessoas ao meu redor aprovam o que eu faço e quem eu sou.', desc: 'Precisa sentir-se aceito no ambiente de trabalho e no time.' },
  { id: 'maestria', nome: 'Maestria', cor: '#7CC0AA', claro: true, frase: 'Meu trabalho desafia minha competência, mas ainda está dentro das minhas capacidades.', desc: 'Motivados por desafios onde possam demonstrar competências, habilidades e aptidões.' },
  { id: 'liberdade', nome: 'Liberdade', cor: '#E0483C', frase: 'Sou independente dos outros em relação ao meu trabalho e às minhas responsabilidades.', desc: 'Precisam de autonomia e flexibilidade para realizar suas atividades.' },
  { id: 'ordem', nome: 'Ordem', cor: '#F2B8C6', claro: true, frase: 'Existem regras e políticas suficientes para um ambiente estável.', desc: 'Segurança, organização e estabilidade: ambiente com regras e procedimentos definidos.' },
  { id: 'curiosidade', nome: 'Curiosidade', cor: '#F2A531', claro: true, frase: 'Tenho muitas coisas para investigar e sobre as quais pensar.', desc: 'Gostam de atividades de investigação, pesquisa e análise.' },
  { id: 'honra', nome: 'Honra', cor: '#4FB3DE', claro: true, frase: 'Sinto orgulho de que meus valores pessoais se reflitam na maneira como trabalho.', desc: 'Gostam de ter condutas e virtudes reconhecidas no ambiente de trabalho.' },
  { id: 'meta', nome: 'Meta', cor: '#4A3A8C', frase: 'Meu propósito de vida se reflete no trabalho que realizo.', desc: 'Metas alinhadas ao propósito de vida geram orgulho profissional e pessoal.' }
]
export const IDS = MM.map(m => m.id)
export const byId = id => MM.find(m => m.id === id)
export const AXES = ['curiosidade', 'honra', 'aceitacao', 'poder', 'maestria', 'liberdade', 'relacao', 'meta', 'ordem', 'status']
export const FEL = [
  { k: 'eu', nome: 'EU', rotulo: 'Eu', grupo: 'Cultural', pergunta: 'Seu próprio desempenho' },
  { k: 'time', nome: 'TIME', rotulo: 'Time', grupo: 'Cultural', pergunta: 'O time com o qual você trabalha' },
  { k: 'org', nome: 'ORGANIZAÇÃO', rotulo: 'Organização', grupo: 'Cultural', pergunta: 'A nossa organização' },
  { k: 'entregas', nome: 'ENTREGAS', rotulo: 'Entregas', grupo: 'Negócio', pergunta: 'As entregas do time' },
  { k: 'proc', nome: 'PROCESSO', rotulo: 'Processos', grupo: 'Organizacional', pergunta: 'Os processos que adotamos' },
  { k: 'ferr', nome: 'FERRAMENTAS', rotulo: 'Ferramentas', grupo: 'Técnico', pergunta: 'As ferramentas que usamos' }
]
export const TIMES = ['Seal Team', 'Fênix Team']
export const TEMPOS = ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', 'Mais de 5 anos']
export const OUTRA = 'Outra (descrever)'
export const OPC = ['Novo membro no time', 'Saída de um membro do time', 'Mudança de liderança', 'Reorganização entre Seal Team e Fênix Team', 'Adoção de novo processo (Kanban/Scrum)', 'Nova ferramenta de trabalho', 'Trabalho remoto ou híbrido', 'Novo projeto ou cliente', 'Promoção ou nova função', OUTRA]

export const ang = (i, n) => (Math.PI * 2 * i) / n - Math.PI / 2
export const pt = (c, r, a) => [c + r * Math.cos(a), c + r * Math.sin(a)]
export const points = (c, R, max, vals) =>
  vals.map((v, i) => { const p = pt(c, (R * v) / max, ang(i, vals.length)); return p[0].toFixed(1) + ',' + p[1].toFixed(1) }).join(' ')

// ordem[0] = most important. Weight 10..1.
export const saldo = (ordem, imp) => ordem.reduce((s, id, i) => s + (imp[id] || 0) * (10 - i), 0)
export const alerta = (ordem, imp) =>
  ordem.slice(0, 3).some(id => imp[id] === -1) || ordem.slice(7).some(id => imp[id] === 1)
export const media = xs => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

export const isPermutation = o => Array.isArray(o) && o.length === IDS.length && IDS.every(id => o.includes(id))
export const validImp = imp => imp && typeof imp === 'object' && Object.entries(imp).every(([k, v]) => IDS.includes(k) && [-1, 0, 1].includes(v))
export const validFel = fel => fel && typeof fel === 'object' && Object.entries(fel).every(([k, v]) => FEL.some(f => f.k === k) && [1, 2, 3, 4].includes(v))
