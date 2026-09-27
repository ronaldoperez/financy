import { gql } from '@apollo/client'

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: String!) { deleteCategory(id: $id) }
`