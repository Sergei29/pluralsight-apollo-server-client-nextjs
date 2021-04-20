import React from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { GET_SPEAKERS } from "../graphql/queries";
import { TOGGLE_SPEAKER_FAVOURITE, DELETE_SPEAKER } from "../graphql/mutations";
import { checkBoxListVar, paginationDataVar } from "../graphql/apolloClient";

const SpeakerItem = ({ speakerRec }) => {
  const { id, first, last, favourite, fullName, checkBoxColumn } = speakerRec;
  const [toggleSpeakerFavourite] = useMutation(TOGGLE_SPEAKER_FAVOURITE);
  const [deleteSpeaker] = useMutation(DELETE_SPEAKER);
  const selectedSpeakersIds = useReactiveVar(checkBoxListVar);
  const paginationData = useReactiveVar(paginationDataVar);

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
    const { offset, limit, currentPage } = paginationData;
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
        const { speakers } = cache.readQuery({
          query: GET_SPEAKERS,
          variables: {
            offset: currentPage * limit,
            limit,
          },
        });
        cache.writeQuery({
          query: GET_SPEAKERS,
          variables: {
            offset: currentPage * limit,
            limit,
          },
          data: {
            speakers: {
              __typename: "SpeakerResults",
              datalist: speakers.datalist.filter(
                (objSpeaker) => objSpeaker.id !== deleteSpeaker.id
              ),
              pageInfo: {
                __typename: "PageInfo",
                totalItemCount: 0,
              },
            },
          },
        });
      },
    });
  };

  const handleCheck = () => {
    const newSelectedIds =
      checkBoxColumn === true
        ? selectedSpeakersIds.filter((currentId) => currentId !== id)
        : selectedSpeakersIds
        ? [...selectedSpeakersIds, id]
        : [id];
    checkBoxListVar(newSelectedIds);
  };

  return (
    <div className="favbox" key={id}>
      <div className="fav-clm col-sm-7">
        <span
          className={checkBoxColumn ? "fa fa-check-square-o" : "fa fa-square-o"}
          onClick={handleCheck}
        />
        <h4>
          {fullName} ({id})
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
