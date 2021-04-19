import React from "react";
import { useMutation } from "@apollo/client";
import { GET_SPEAKERS } from "../graphql/queries";
import { TOGGLE_SPEAKER_FAVOURITE, DELETE_SPEAKER } from "../graphql/mutations";

const SpeakerItem = ({ speakerRec }) => {
  const { id, first, last, favourite } = speakerRec;
  const [toggleSpeakerFavourite] = useMutation(TOGGLE_SPEAKER_FAVOURITE);
  const [deleteSpeaker] = useMutation(DELETE_SPEAKER);

  const handleToggleFavourite = (id, first, last, favourite) => {
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

  const handleDelete = (id, first, last, favourite) => {
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

  return (
    <div className="favbox" key={id}>
      <div className="fav-clm col-sm-7">
        <h4>
          {first} {last} ({id})
        </h4>
      </div>
      <div className="fav-clm col-sm-5">
        <span className="action">
          <span
            onClick={() => handleToggleFavourite(id, first, last, favourite)}
          >
            <span
              className={
                favourite === true ? "fa fa-star orange" : "fa fa-star-o orange"
              }
            />
            &nbsp;&nbsp; Favourite
          </span>
          <span onClick={() => handleDelete(id, first, last, favourite)}>
            <span className="fa fa-trash red" />
            &nbsp;&nbsp;Delete
          </span>
        </span>
      </div>
    </div>
  );
};

export default SpeakerItem;
