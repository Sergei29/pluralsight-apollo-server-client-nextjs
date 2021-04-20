import { useReactiveVar } from "@apollo/client";
import { paginationDataVar } from "../graphql/apolloClient";

const PagingOffsetLimitControl = ({ lastPage }) => {
  const paginationData = useReactiveVar(paginationDataVar);
  const { currentPage } = paginationData;

  const handleGoNext = () => {
    if (currentPage < lastPage) {
      paginationDataVar({
        ...paginationData,
        currentPage: currentPage + 1,
      });
    }
  };

  const handleGoPrev = () => {
    if (currentPage > 0) {
      paginationDataVar({
        ...paginationData,
        currentPage: currentPage - 1,
      });
    }
  };

  const handleGoLast = () => {
    paginationDataVar({
      ...paginationData,
      currentPage: lastPage,
    });
  };

  const handleGoFirst = () => {
    paginationDataVar({
      ...paginationData,
      currentPage: 0,
    });
  };

  return (
    <div className="pagination">
      <a
        href="#"
        className="page-link"
        aria-label="First"
        onClick={handleGoFirst}
      >
        <i className="fa fa-angle-double-left" aria-hidden="true"></i>
      </a>
      <a
        href="#"
        className="page-link"
        aria-label="Previous"
        onClick={handleGoPrev}
      >
        <i className="fa fa-angle-left" aria-hidden="true"></i>
      </a>
      &nbsp;{currentPage + 1}&nbsp;
      <a
        href="#"
        className="page-link"
        aria-label="Next"
        onClick={handleGoNext}
      >
        <i className="fa fa-angle-right" aria-hidden="true"></i>
      </a>
      <a
        href="#"
        className="page-link"
        aria-label="Last"
        onClick={handleGoLast}
      >
        <i className="fa fa-angle-double-right" aria-label="last"></i>
      </a>
    </div>
  );
};

export default PagingOffsetLimitControl;
