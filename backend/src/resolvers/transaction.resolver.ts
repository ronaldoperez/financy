import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { IsAuth } from '../middlewares/auth.middleware'
import { GraphqlContext } from '../graphql/context'
import { CreateTransactionInput, UpdateTransactionInput } from '../dtos/input/transaction.input'
import { TransactionModel } from '../models/transaction.model'
import { TransactionService } from '../services/transaction.service'

@Resolver(() => TransactionModel)
@UseMiddleware(IsAuth)
export class TransactionResolver {
  private service = new TransactionService()

  @Query(() => [TransactionModel])
  listTransactions(@Ctx() context: GraphqlContext) {
    return this.service.list(context.userId!)
  }

  @Mutation(() => TransactionModel)
  createTransaction(@Arg('data', () => CreateTransactionInput) data: CreateTransactionInput, @Ctx() context: GraphqlContext) {
    return this.service.create(context.userId!, data)
  }

  @Mutation(() => TransactionModel)
  updateTransaction(@Arg('id', () => String) id: string, @Arg('data', () => UpdateTransactionInput) data: UpdateTransactionInput, @Ctx() context: GraphqlContext) {
    return this.service.update(context.userId!, id, data)
  }

  @Mutation(() => Boolean)
  async deleteTransaction(@Arg('id', () => String) id: string, @Ctx() context: GraphqlContext) {
    await this.service.delete(context.userId!, id)
    return true
  }
}
