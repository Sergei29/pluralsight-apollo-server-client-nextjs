import React, { useState } from "react";
import { useMutation, useApolloClient, useReactiveVar } from "@apollo/client";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { ADD_SPEAKER, TOGGLE_SPEAKER_FAVORITE } from "../graphql/mutations";
import { GET_SPEAKERS } from "../graphql/queries";
import {
  currentThemeVar,
  checkBoxListVar,
  paginationDataVar,
} from "../graphql/apolloClient";
import PagingOffsetLimitControl from "./PagingOffsetLimitControl";

const Toolbar = ({ totalItemCount }) => {
  const [modal, setModal] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [addSpeaker] = useMutation(ADD_SPEAKER);
  const [toggleSpeakerFavorite] = useMutation(TOGGLE_SPEAKER_FAVORITE);
  const apolloClient = useApolloClient();
  const currentTheme = useReactiveVar(currentThemeVar);
  const selectedSpeakersIds = useReactiveVar(checkBoxListVar);
  const paginationData = useReactiveVar(paginationDataVar);

  const addSpeakerEvent = (first, last, favorite) => {
    const { offset, limit, currentPage } = paginationData;
    addSpeaker({
      variables: { speaker: { first, last, favorite } },
      update: (cache, { data: { addSpeaker } }) => {
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
              datalist: [...speakers.datalist, addSpeaker],
              pageInfo: {
                __typename: "PageInfo",
                totalItemCount,
              },
            },
          },
        });
      },
    });
  };

  const sortByIdDescending = () => {
    const { offset, limit, currentPage } = paginationData;
    const { speakers } = apolloClient.cache.readQuery({
      query: GET_SPEAKERS,
      variables: {
        offset: currentPage * limit,
        limit,
      },
    });
    const sortedDatalist = [...speakers.datalist].sort((a, b) => b.id - a.id);
    apolloClient.cache.writeQuery({
      query: GET_SPEAKERS,
      variables: { offset: currentPage * limit, limit },
      data: {
        speakers: {
          __typename: "SpeakerResults",
          datalist: sortedDatalist,
          pageInfo: {
            __typename: "PageInfo",
            totalItemCount,
          },
        },
      },
    });
  };

  const toggleModal = () => {
    setModal((prevModal) => !prevModal);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addSpeakerEvent(first, last, favorite);
    setFirst("");
    setLast("");
    setFavorite(false);
    setModal((prevModal) => !prevModal);
  };

  /**
   * @description toggles favorite for all checked Speakers
   * @returns {undefined}
   */
  const handleToggleCheckAll = () => {
    if (selectedSpeakersIds) {
      selectedSpeakersIds.forEach((speakerId) => {
        toggleSpeakerFavorite({
          variables: { speakerId: parseInt(speakerId) },
        });
      });
    }
  };

  const lastPage = Math.trunc((totalItemCount - 1) / paginationData.limit);
  return (
    <section className="toolbar">
      <div className="container">
        <ul className="toolrow">
          <li>
            <PagingOffsetLimitControl lastPage={lastPage} />
          </li>
          <li>
            <label className="dropmenu">
              <select
                className="form-control theme"
                onChange={(e) => currentThemeVar(e.currentTarget.value)}
                value={currentTheme}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </li>
          <li>
            <div>
              <Button color="info" onClick={toggleModal}>
                <span>Insert Speaker</span>
              </Button>
              &nbsp;
              <Button color="info" onClick={sortByIdDescending}>
                <span>Sort Speakers by ID Decending</span>
              </Button>
              &nbsp;
              <Button color="info" onClick={handleToggleCheckAll}>
                <span>Toggle All Checked</span>
              </Button>
              <Modal isOpen={modal} toggle={toggleModal}>
                <Form onSubmit={handleSubmit}>
                  <ModalHeader toggle={toggleModal}>
                    Insert Speaker Dialog
                  </ModalHeader>
                  <ModalBody>
                    <FormGroup>
                      <Label for="first">First Name</Label>{" "}
                      <Input
                        name="first"
                        onChange={(e) => setFirst(e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="first">Last Name</Label>{" "}
                      <Input
                        name="first"
                        onChange={(e) => setLast(e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="checkbox"
                          onChange={(e) => setFavorite(e.target.value === "on")}
                        />{" "}
                        Favorite
                      </Label>
                    </FormGroup>
                  </ModalBody>
                  <ModalFooter>
                    <Button type="submit">Save</Button>
                  </ModalFooter>
                </Form>
              </Modal>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Toolbar;
