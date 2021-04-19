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
import { ADD_SPEAKER, TOGGLE_SPEAKER_FAVOURITE } from "../graphql/mutations";
import { GET_SPEAKERS } from "../graphql/queries";
import { currentThemeVar, checkBoxListVar } from "../graphql/apolloClient";

const Toolbar = () => {
  const [modal, setModal] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [favourite, setFavorite] = useState(false);
  const [addSpeaker] = useMutation(ADD_SPEAKER);
  const [toggleSpeakerFavourite] = useMutation(TOGGLE_SPEAKER_FAVOURITE);
  const apolloClient = useApolloClient();
  const currentTheme = useReactiveVar(currentThemeVar);
  const selectedSpeakersIds = useReactiveVar(checkBoxListVar);

  const addSpeakerEvent = (first, last, favourite) => {
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

  const toggleModal = () => {
    setModal((prevModal) => !prevModal);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addSpeakerEvent(first, last, favourite);
    setFirst("");
    setLast("");
    setFavorite(false);
    setModal((prevModal) => !prevModal);
  };

  /**
   * @description toggles favourite for all checked Speakers
   * @returns {undefined}
   */
  const handleToggleCheckAll = () => {
    if (selectedSpeakersIds) {
      selectedSpeakersIds.forEach((speakerId) => {
        toggleSpeakerFavourite({
          variables: { speakerId: parseInt(speakerId) },
        });
      });
    }
  };

  return (
    <section className="toolbar">
      <div className="container">
        <ul className="toolrow">
          <li>
            <strong>Theme &nbsp;</strong>
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
