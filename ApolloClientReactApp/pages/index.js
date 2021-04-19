import React from "react";
import { gql, useQuery, useMutation, useApolloClient } from "@apollo/client";
import Toolbar from "../components/Toolbar";

const GET_SPEAKERS = gql`
  query SpeakerResults {
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
  const apolloClient = useApolloClient();

  if (loading === true) return <div className="col-sm-6">Loading...</div>;
  if (error) return <div className="col-sm-6">Error: {error.message}</div>;

  const handleAddNewSpeaker = (first, last, favourite) => {
    addSpeaker({
      variables: { speaker: { first, last, favourite } },
      update: (cache, { data: { addSpeaker } }) => {
        const { speakers } = cache.readQuery({ query: GET_SPEAKERS });
        cache.writeQuery({
          query: GET_SPEAKERS,
          data: {
            speakers: {
              __typename: "SpeakerResults",
              datalist: [addSpeaker, ...speakers.datalist],
            },
          },
        });
      },
    });
  };

  const handleDeleteSpeaker = (id, first, last, favourite) => {
    deleteSpeaker({
      variables: { speakerId: parseInt(id) },
      optimisticResponse: {
        __typename: "Mutation",
        deleteSpeaker: {
          __typename: "Speaker",
          id,
          first,
          last,
          favourite,
        },
      },
      update: (cache, { data: { deleteSpeaker } }) => {
        const { speakers } = cache.readQuery({ query: GET_SPEAKERS });
        cache.writeQuery({
          query: GET_SPEAKERS,
          data: {
            speakers: {
              __typename: "SpeakerResults",
              datalist: speakers.datalist.filter(
                (objSpeaker) => objSpeaker.id !== deleteSpeaker.id
              ),
            },
          },
        });
      },
    });
  };

  const toggleFavourite = (id, first, last, favourite) => {
    toggleSpeakerFavourite({
      variables: { speakerId: parseInt(id) },
      optimisticResponse: {
        __typename: "Mutation",
        toggleSpeakerFavourite: {
          __typename: "Speaker",
          id,
          first,
          last,
          favourite: !favourite,
        },
      },
    });
  };

  const sortByIdDescending = () => {
    const { speakers } = apolloClient.cache.readQuery({ query: GET_SPEAKERS });
    apolloClient.cache.writeQuery({
      query: GET_SPEAKERS,
      data: {
        speakers: {
          __typename: "SpeakerResults",
          datalist: [...speakers.datalist].sort((a, b) => b.id - a.id),
        },
      },
    });
  };

  return (
    <>
      <Toolbar
        insertSpeakerEvent={handleAddNewSpeaker}
        sortByIdDescending={sortByIdDescending}
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
                        toggleFavourite(id, first, last, favourite)
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
                        handleDeleteSpeaker(id, first, last, favourite)
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
