import { Arg, Mutation, Resolver } from 'type-graphql'
import { LoginInput, RegisterInput } from '../dtos/input/auth.input'
import { AuthOutput } from '../dtos/output/auth.output'
import { AuthService } from '../services/auth.service'

@Resolver()
export class AuthResolver {
  private service = new AuthService()

  @Mutation(() => AuthOutput)
  login(@Arg('data', () => LoginInput) data: LoginInput) {
    return this.service.login(data)
  }

  @Mutation(() => AuthOutput)
  register(@Arg('data', () => RegisterInput) data: RegisterInput) {
    return this.service.register(data)
  }
}
