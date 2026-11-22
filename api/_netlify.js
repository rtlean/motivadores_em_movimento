// Roda os handlers de /api (estilo req/res) como funções da Netlify (Request/Response).
export function adapt(handler) {
  return async request => {
    const url = new URL(request.url)
    const text = request.method === 'GET' || request.method === 'HEAD' ? '' : await request.text()
    let body
    try { body = text ? JSON.parse(text) : undefined } catch { return Response.json({ error: 'JSON inválido.' }, { status: 400 }) }
    const req = { method: request.method, query: Object.fromEntries(url.searchParams), headers: Object.fromEntries(request.headers), body }
    let status = 200, payload = null
    const headers = {}
    const res = {
      status(s) { status = s; return res },
      setHeader(k, v) { headers[k] = v },
      json(d) { payload = JSON.stringify(d); headers['Content-Type'] = 'application/json' },
      end() {}
    }
    await handler(req, res)
    return new Response(status === 204 ? null : payload, { status, headers })
  }
}
