import { prismaClient } from '../../prisma/prisma'
import { CreateCategoryInput, UpdateCategoryInput } from '../dtos/input/category.input'

export class CategoryService {
  list(userId: string) {
    return prismaClient.category.findMany({ where: { userId }, orderBy: { name: 'asc' } })
  }

  create(userId: string, data: CreateCategoryInput) {
    return prismaClient.category.create({
      data: {
        ...data,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        icon: data.icon?.trim() || null,
        color: data.color?.trim() || null,
        userId,
      },
    })
  }

  async update(userId: string, id: string, data: UpdateCategoryInput) {
    await this.ensureCategory(userId, id)
    return prismaClient.category.update({
      where: { id },
      data: {
        ...data,
        name: data.name?.trim(),
        description: data.description?.trim(),
        icon: data.icon?.trim(),
        color: data.color?.trim(),
      },
    })
  }

  async delete(userId: string, id: string) {
    await this.ensureCategory(userId, id)
    const transactions = await prismaClient.transaction.count({ where: { categoryId: id, userId } })
    if (transactions > 0) throw new Error('Não é possível excluir uma categoria com transações.')
    await prismaClient.category.delete({ where: { id } })
  }

  private async ensureCategory(userId: string, id: string) {
    const category = await prismaClient.category.findFirst({ where: { id, userId } })
    if (!category) throw new Error('Categoria não encontrada.')
    return category
  }
}
