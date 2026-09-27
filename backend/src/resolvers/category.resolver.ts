import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { CreateCategoryInput, UpdateCategoryInput } from '../dtos/input/category.input'
import { CategoryModel } from '../models/category.model'
import { GraphqlContext } from '../graphql/context'
import { IsAuth } from '../middlewares/auth.middleware'
import { CategoryService } from '../services/category.service'

@Resolver(() => CategoryModel)
@UseMiddleware(IsAuth)
export class CategoryResolver {
  private service = new CategoryService()

  @Query(() => [CategoryModel])
  listCategories(@Ctx() context: GraphqlContext) {
    return this.service.list(context.userId!)
  }

  @Mutation(() => CategoryModel)
  createCategory(@Arg('data', () => CreateCategoryInput) data: CreateCategoryInput, @Ctx() context: GraphqlContext) {
    return this.service.create(context.userId!, data)
  }

  @Mutation(() => CategoryModel)
  updateCategory(@Arg('id', () => String) id: string, @Arg('data', () => UpdateCategoryInput) data: UpdateCategoryInput, @Ctx() context: GraphqlContext) {
    return this.service.update(context.userId!, id, data)
  }

  @Mutation(() => Boolean)
  async deleteCategory(@Arg('id', () => String) id: string, @Ctx() context: GraphqlContext) {
    await this.service.delete(context.userId!, id)
    return true
  }
}
