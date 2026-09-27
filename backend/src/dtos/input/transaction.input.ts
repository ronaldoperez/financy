import { Field, Float, GraphQLISODateTime, InputType } from 'type-graphql'
import { TransactionType } from '../../models/transaction.model'

@InputType()
export class CreateTransactionInput {
  @Field(() => String) description!: string
  @Field(() => Float) amount!: number
  @Field(() => TransactionType) type!: TransactionType
  @Field(() => String) categoryId!: string
  @Field(() => GraphQLISODateTime, { nullable: true }) date?: Date
}

@InputType()
export class UpdateTransactionInput {
  @Field(() => String, { nullable: true }) description?: string
  @Field(() => Float, { nullable: true }) amount?: number
  @Field(() => TransactionType, { nullable: true }) type?: TransactionType
  @Field(() => String, { nullable: true }) categoryId?: string
  @Field(() => GraphQLISODateTime, { nullable: true }) date?: Date
}
