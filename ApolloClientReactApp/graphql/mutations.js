import { gql } from "@apollo/client";

export const TOGGLE_SPEAKER_FAVORITE = gql`
  mutation ToggleSpeakerFavorite($speakerId: Int!) {
    toggleSpeakerFavorite(speakerId: $speakerId) {
      id
      first
      last
      favorite
    }
  }
`;

export const DELETE_SPEAKER = gql`
  mutation DeleteSpeaker($speakerId: Int!) {
    deleteSpeaker(speakerId: $speakerId) {
      id
      first
      last
      favorite
    }
  }
`;

export const ADD_SPEAKER = gql`
  mutation AddSpeaker($speaker: SpeakerInput!) {
    addSpeaker(speaker: $speaker) {
      id
      first
      last
      favorite
    }
  }
`;
