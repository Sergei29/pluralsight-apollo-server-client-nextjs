import { gql } from "@apollo/client";

export const TOGGLE_SPEAKER_FAVOURITE = gql`
  mutation ToggleSpeakerFavourite($speakerId: Int!) {
    toggleSpeakerFavourite(speakerId: $speakerId) {
      id
      first
      last
      favourite
    }
  }
`;

export const DELETE_SPEAKER = gql`
  mutation DeleteSpeaker($speakerId: Int!) {
    deleteSpeaker(speakerId: $speakerId) {
      id
      first
      last
      favourite
    }
  }
`;

export const ADD_SPEAKER = gql`
  mutation AddSpeaker($speaker: SpeakerInput!) {
    addSpeaker(speaker: $speaker) {
      id
      first
      last
      favourite
    }
  }
`;
