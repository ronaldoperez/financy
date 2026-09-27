import { prismaClient } from '../../prisma/prisma'
import { CreateTransactionInput, UpdateTransactionInput } from '../dtos/input/transaction.input'

export class TransactionService {
  list(userId: string) {
    return prismaClient.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
    })
  }

  async create(userId: string, data: CreateTransactionInput) {
    await this.ensureCategory(userId, data.categoryId)
    return prismaClient.transaction.create({
      data: { ...data, date: data.date ?? new Date(), userId },
      include: { category: true },
    })
  }

  async update(userId: string, id: string, data: UpdateTransactionInput) {
    await this.ensureTransaction(userId, id)
    if (data.categoryId) await this.ensureCategory(userId, data.categoryId)
    return prismaClient.transaction.update({
      where: { id },
      data,
      include: { category: true },
    })
  }

  async delete(userId: string, id: string) {
    await this.ensureTransaction(userId, id)
    await prismaClient.transaction.delete({ where: { id } })
  }

  private async ensureTransaction(userId: string, id: string) {
    const transaction = await prismaClient.transaction.findFirst({ where: { id, userId } })
    if (!transaction) throw new Error('Transação não encontrada.')
    return transaction
  }

  private async ensureCategory(userId: string, id: string) {
    const category = await prismaClient.category.findFirst({ where: { id, userId } })
    if (!category) throw new Error('Categoria não encontrada.')
  }
}
