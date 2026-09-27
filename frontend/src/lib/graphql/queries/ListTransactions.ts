import { gql } from '@apollo/client'

export const LIST_TRANSACTIONS = gql`
  query ListTransactions {
    listTransactions {
      id description amount type categoryId date
      category { id name color icon }
    }
  }
`