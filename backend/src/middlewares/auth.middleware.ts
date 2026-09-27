import { MiddlewareFn } from 'type-graphql'
import { GraphqlContext } from '../graphql/context'

export const IsAuth: MiddlewareFn<GraphqlContext> = async ({ context }, next) => {
  if (!context.userId) throw new Error('Usuário não autenticado!')
  return next()
}
