import { gql } from "@apollo/client";

export const GET_SPEAKERS = gql`
  query SpeakerResults($offset: Int = 0, $limit: Int = -1) {
    speakers(offset: $offset, limit: $limit) {
      datalist {
        id
        first
        last
        favourite
        fullName @client
        checkBoxColumn @client
      }
      pageInfo {
        totalItemCount
      }
    }
  }
`;
