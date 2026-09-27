import { prismaClient } from '../../prisma/prisma'
import { LoginInput, RegisterInput } from '../dtos/input/auth.input'
import { UserModel } from '../models/user.model'
import { comparePassword, hashPassword } from '../utils/hash'
import { signJwt } from '../utils/jwt'

export class AuthService {
  async register(data: RegisterInput) {
    const name = data.name.trim()
    const email = data.email.trim().toLowerCase()
    if (name.split(/\s+/).length < 2) throw new Error('Informe o nome completo.')
    if (!data.password) throw new Error('Informe a senha.')
    const existing = await prismaClient.user.findUnique({ where: { email } })
    if (existing) throw new Error('E-mail já cadastrado!')
    const user = await prismaClient.user.create({
      data: { name, email, password: await hashPassword(data.password) },
    })
    return this.tokens(user)
  }

  async login(data: LoginInput) {
    const user = await prismaClient.user.findUnique({ where: { email: data.email.trim().toLowerCase() } })
    if (!user || !(await comparePassword(data.password, user.password))) throw new Error('Credenciais inválidas!')
    return this.tokens(user)
  }

  private tokens(user: UserModel) {
    return {
      token: signJwt({ id: user.id, email: user.email }),
      refreshToken: signJwt({ id: user.id, email: user.email }, '7d'),
      user,
    }
  }
}
