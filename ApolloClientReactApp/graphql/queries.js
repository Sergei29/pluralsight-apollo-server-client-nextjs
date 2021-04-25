import { gql } from "@apollo/client";

export const GET_SPEAKERS = gql`
  query SpeakerResults($offset: Int = 0, $limit: Int = -1) {
    speakers(offset: $offset, limit: $limit) {
      datalist {
        id
        first
        last
        favorite
        fullName @client
        checkBoxColumn @client
      }
      pageInfo {
        totalItemCount
      }
    }
  }
`;

export const GET_SPEAKERS_CONCAT = gql`
  query SpeakersConcat($limit: Int = 0, $afterCursor: String = "") {
    speakersConcat(limit: $limit, afterCursor: $afterCursor) {
      datalist {
        id
        first
        last
        favorite
        cursor
        fullName @client
        checkBoxColumn @client
      }
      pageInfo {
        totalItemCount
        lastCursor
        hasNextPage
      }
    }
  }
`;

export const GET_SESSIONS_CONCAT = gql`
  query SessionsConcat($limit: Int = 0, $afterCursor: String = "") {
    sessionsConcat(limit: $limit, afterCursor: $afterCursor) {
      datalist {
        id
        title
        eventYear
        cursor
      }
      pageInfo {
        totalItemCount
        lastCursor
        hasNextPage
      }
    }
  }
`;
