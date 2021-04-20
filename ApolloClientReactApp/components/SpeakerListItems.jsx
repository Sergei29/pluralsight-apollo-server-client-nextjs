import { useQuery, useReactiveVar } from "@apollo/client";
import { GET_SPEAKERS } from "../graphql/queries";
import { currentThemeVar, paginationDataVar } from "../graphql/apolloClient";
import SpeakerItem from "./SpeakerItem";
import Toolbar from "./Toolbar";

const SpeakerListItems = () => {
  const paginationData = useReactiveVar(paginationDataVar);
  const { limit, currentPage } = paginationData;
  const { loading, error, data } = useQuery(GET_SPEAKERS, {
    variables: { offset: currentPage * limit, limit },
  });
  const currentTheme = useReactiveVar(currentThemeVar);

  if (loading === true) return <div className="col-sm-6">Loading...</div>;
  if (error) return <div className="col-sm-6">Error: {error.message}</div>;

  return (
    <>
      <Toolbar totalItemCount={data.speakers.pageInfo.totalItemCount} />
      <div className="container show-fav">
        <div className="row">
          <div
            className={currentTheme === "dark" ? "fav-list dark" : "fav-list"}
          >
            {data.speakers.datalist.map(
              ({ id, first, last, favourite, fullName, checkBoxColumn }) => (
                <SpeakerItem
                  key={id}
                  speakerRec={{
                    id,
                    first,
                    last,
                    favourite,
                    fullName,
                    checkBoxColumn,
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SpeakerListItems;
