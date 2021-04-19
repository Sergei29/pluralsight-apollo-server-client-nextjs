import { gql } from "@apollo/client";

export const GET_SPEAKERS = gql`
  query SpeakerResults {
    speakers {
      datalist {
        id
        first
        last
        favourite
        fullName @client
        checkBoxColumn @client
      }
    }
  }
`;
