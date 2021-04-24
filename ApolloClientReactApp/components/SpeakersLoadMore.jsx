import React from "react";
import { useQuery, NetworkStatus } from "@apollo/client";
import { GET_SPEAKERS_CONCAT } from "../graphql/queries";

const SpeakersLoadMore = () => {
  const { loading, error, data, fetchMore, networkStatus } = useQuery(
    GET_SPEAKERS_CONCAT,
    {
      variables: {
        limit: 4,
        afterCursor: "",
      },
      notifyOnNetworkStatusChange: true,
    }
  );
  const loadingMoreSpeakers = networkStatus === NetworkStatus.fetchMore;

  if (loading && !loadingMoreSpeakers) {
    return <div className="col-sm-6">Loading...</div>;
  }
  if (error) return <div className="col-sm-6">Error: {error.message}</div>;

  const { datalist } = data.speakersConcat;
  const {
    totalItemCount,
    lastCursor,
    hasNextPage,
  } = data.speakersConcat.pageInfo;

  const handleFetchMore = () => {
    fetchMore({
      variables: {
        limit: 4,
        afterCursor: lastCursor,
      },
    });
  };

  return (
    <div className="container show-fav mt-3">
      {datalist.map(({ id, first, last }) => (
        <div key={id} className="col-sm-12">
          {`${first} ${last} (${id})`}
        </div>
      ))}
      {hasNextPage && (
        <button
          className="btn btn-primary mt-2"
          onClick={handleFetchMore}
          disabled={loadingMoreSpeakers}
        >
          {loadingMoreSpeakers ? "loading..." : "show more..."}
        </button>
      )}
    </div>
  );
};

export default SpeakersLoadMore;
