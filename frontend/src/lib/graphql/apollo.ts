import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { useAuthStore } from '@/stores/auth'

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_BACKEND_URL,
})

const authLink = new SetContextLink((previousContext) => {
  const token = useAuthStore.getState().token
  return {
    headers: {
      ...previousContext.headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
