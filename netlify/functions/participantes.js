import handler from '../../api/participantes.js'
import { adapt } from '../../api/_netlify.js'

export default adapt(handler)
export const config = { path: '/api/participantes' }
