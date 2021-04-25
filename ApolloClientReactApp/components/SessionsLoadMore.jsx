import React from "react";
import { useQuery, NetworkStatus } from "@apollo/client";
import { GET_SESSIONS_CONCAT } from "../graphql/queries";

const SessionsLoadMore = () => {
  const { loading, error, data, fetchMore, networkStatus } = useQuery(
    GET_SESSIONS_CONCAT,
    {
      variables: {
        limit: 4,
        afterCursor: "",
      },
      notifyOnNetworkStatusChange: true,
    }
  );
  const loadingMoreSessions = networkStatus === NetworkStatus.fetchMore;

  if (loading && !loadingMoreSessions) {
    return <div className="col-sm-6">Loading...</div>;
  }
  if (error) return <div className="col-sm-6">Error: {error.message}</div>;

  const { datalist } = data.sessionsConcat;
  const { lastCursor, hasNextPage } = data.sessionsConcat.pageInfo;

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
      {datalist.map(({ id, title, eventYear }) => (
        <div key={id} className="col-sm-12">
          {`${eventYear} ${title} (${id})`}
        </div>
      ))}
      {hasNextPage && (
        <button
          className="btn btn-primary mt-2"
          onClick={handleFetchMore}
          disabled={loadingMoreSessions}
        >
          {loadingMoreSessions ? "loading..." : "show more..."}
        </button>
      )}
    </div>
  );
};

export default SessionsLoadMore;
