import React from "react";
import { useQuery } from "@apollo/client";
import { GET_SPEAKERS } from "../graphql/queries";
import SpeakerCard from "./SpeakerCard";

const HomePage = () => {
  const { loading, error, data } = useQuery(GET_SPEAKERS);

  if (loading === true) return <div className="col-sm-6">Loading...</div>;
  if (error) return <div className="col-sm-6">Error: {error.message}</div>;

  return (
    <section className="speakers">
      <div className="container">
        <div className="row">
          <div className="speakers-list">
            {data.speakers.datalist.map((objSpeaker) => (
              <SpeakerCard key={objSpeaker.id} speakerRec={objSpeaker} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
