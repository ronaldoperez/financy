import 'reflect-metadata'
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import { buildSchema } from 'type-graphql'
import { AuthResolver } from './resolvers/auth.resolver'
import { CategoryResolver } from './resolvers/category.resolver'
import { TransactionResolver } from './resolvers/transaction.resolver'
import { buildContext } from './graphql/context'

async function bootstrap() {
  const app = express()
  const schema = await buildSchema({
    resolvers: [AuthResolver, CategoryResolver, TransactionResolver],
    validate: false,
    emitSchemaFile: './schema.graphql',
  })
  const server = new ApolloServer({ schema })
  await server.start()

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }))
  app.use('/graphql', express.json(), expressMiddleware(server, { context: buildContext }))

  const port = Number(process.env.PORT || 4001)
  app.listen(port, () => console.log(`Financy API iniciada na porta ${port}!`))
}

bootstrap().catch((error) => {
  console.error('Falha ao iniciar a API:', error)
  process.exitCode = 1
})
