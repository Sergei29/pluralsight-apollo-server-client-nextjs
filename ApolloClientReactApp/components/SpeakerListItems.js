import SpeakerItem from "./SpeakerItem";
import Toolbar from "./Toolbar";
import { useQuery } from "@apollo/client";
import { GET_SPEAKERS } from "../graphql/queries";

const SpeakerListItems = () => {
  const { loading, error, data } = useQuery(GET_SPEAKERS);
  if (loading === true) return <div className="col-sm-6">Loading...</div>;
  if (error) return <div className="col-sm-6">Error: {error.message}</div>;

  return (
    <>
      <Toolbar />
      <div className="container show-fav">
        <div className="row">
          <div className="fav-list">
            {data.speakers.datalist.map(({ id, first, last, favourite }) => (
              <SpeakerItem
                key={id}
                speakerRec={{ id, first, last, favourite }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SpeakerListItems;
