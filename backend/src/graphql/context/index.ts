import { ExpressContextFunctionArgument } from '@as-integrations/express5'
import { verifyJwt } from '../../utils/jwt'

export type GraphqlContext = {
  userId?: string
  req: ExpressContextFunctionArgument['req']
  res: ExpressContextFunctionArgument['res']
}

export const buildContext = async ({ req, res }: ExpressContextFunctionArgument): Promise<GraphqlContext> => {
  const authorization = req.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return { req, res }

  try {
    const payload = verifyJwt(authorization.slice('Bearer '.length))
    return { userId: payload.id, req, res }
  } catch {
    return { req, res }
  }
}
