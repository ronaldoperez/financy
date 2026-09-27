import { hash } from 'bcryptjs'
import { prismaClient } from './prisma'

async function seed() {
  const password = await hash('financy123', 10)
  const user = await prismaClient.user.upsert({
    where: { email: 'demo@financy.com' },
    update: {},
    create: { name: 'Usuário Demo', email: 'demo@financy.com', password },
  })

  await prismaClient.category.createMany({
    data: [
      { name: 'Alimentação', color: '#E07A5F', userId: user.id },
      { name: 'Salário', color: '#2A9D8F', userId: user.id },
    ],
  })
}

seed().finally(() => prismaClient.$disconnect())
