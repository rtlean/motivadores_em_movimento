import handler from '../../api/resultados.js'
import { adapt } from '../../api/_netlify.js'

export default adapt(handler)
export const config = { path: '/api/resultados' }
