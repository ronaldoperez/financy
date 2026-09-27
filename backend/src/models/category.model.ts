import { Field, GraphQLISODateTime, ID, ObjectType } from 'type-graphql'

@ObjectType()
export class CategoryModel {
  @Field(() => ID) id!: string
  @Field(() => String) name!: string
  @Field(() => String, { nullable: true }) description?: string | null
  @Field(() => String, { nullable: true }) icon?: string | null
  @Field(() => String, { nullable: true }) color?: string | null
  @Field(() => String) userId!: string
  @Field(() => GraphQLISODateTime) createdAt!: Date
  @Field(() => GraphQLISODateTime) updatedAt!: Date
}
