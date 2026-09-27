import { Field, Float, GraphQLISODateTime, ID, ObjectType, registerEnumType } from 'type-graphql'
import { CategoryModel } from './category.model'

export enum TransactionType {
  income = 'income',
  expense = 'expense',
}

registerEnumType(TransactionType, { name: 'TransactionType' })

@ObjectType()
export class TransactionModel {
  @Field(() => ID) id!: string
  @Field(() => String) description!: string
  @Field(() => Float) amount!: number
  @Field(() => TransactionType) type!: TransactionType
  @Field(() => GraphQLISODateTime) date!: Date
  @Field(() => String) userId!: string
  @Field(() => String) categoryId!: string
  @Field(() => CategoryModel, { nullable: true }) category?: CategoryModel
  @Field(() => GraphQLISODateTime) createdAt!: Date
  @Field(() => GraphQLISODateTime) updatedAt!: Date
}
