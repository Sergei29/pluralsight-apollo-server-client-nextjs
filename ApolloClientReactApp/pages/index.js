import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import Toolbar from "../components/Toolbar";

const GET_SPEAKERS = gql`
  query {
    speakers {
      datalist {
        id
        first
        last
        favourite
      }
    }
  }
`;

const TOGGLE_SPEAKER_FAVOURITE = gql`
  mutation ToggleSpeakerFavourite($speakerId: Int!) {
    toggleSpeakerFavourite(speakerId: $speakerId) {
      id
      first
      last
      favourite
    }
  }
`;

const DELETE_SPEAKER = gql`
  mutation DeleteSpeaker($speakerId: Int!) {
    deleteSpeaker(speakerId: $speakerId) {
      id
      first
      last
      favourite
    }
  }
`;

const ADD_SPEAKER = gql`
  mutation AddSpeaker($speaker: SpeakerInput!) {
    addSpeaker(speaker: $speaker) {
      id
      first
      last
      favourite
    }
  }
`;

const IndexPage = () => {
  const { loading, error, data } = useQuery(GET_SPEAKERS);
  const [toggleSpeakerFavourite] = useMutation(TOGGLE_SPEAKER_FAVOURITE);
  const [deleteSpeaker] = useMutation(DELETE_SPEAKER);
  const [addSpeaker] = useMutation(ADD_SPEAKER);

  if (loading === true) return <div className="col-sm-6">Loading...</div>;
  if (error) return <div className="col-sm-6">Error: {error.message}</div>;
  return (
    <>
      <Toolbar
        insertSpeakerEvent={(first, last, favourite) => {
          addSpeaker({
            variables: { speaker: { first, last, favourite } },
            refetchQueries: [{ query: GET_SPEAKERS }],
          });
        }}
      />
      <div className="container show-fav">
        <div className="row">
          <div className="fav-list">
            {data.speakers.datalist.map(({ id, first, last, favourite }) => (
              <div className="favbox" key={id}>
                <div className="fav-clm col-sm-7">
                  <h4>
                    {first} {last} ({id})
                  </h4>
                </div>
                <div className="fav-clm col-sm-5">
                  <span className="action">
                    <span
                      onClick={() =>
                        toggleSpeakerFavourite({
                          variables: { speakerId: parseInt(id) },
                        })
                      }
                    >
                      <span
                        className={
                          favourite === true
                            ? "fa fa-star orange"
                            : "fa fa-star-o orange"
                        }
                      />
                      &nbsp;&nbsp; Favourite
                    </span>
                    <span
                      onClick={() =>
                        deleteSpeaker({
                          variables: { speakerId: parseInt(id) },
                          refetchQueries: [{ query: GET_SPEAKERS }],
                        })
                      }
                    >
                      <span className="fa fa-trash red" />
                      &nbsp;&nbsp;Delete
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default IndexPage;
