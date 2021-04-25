/**
 * @description aggregate the fields in cache, using `read: FieldReadFunction` and `merge:FieldMergeFunction` utils from `@apollo/client`
 * @returns {Object} object with field read and merge options described
 */
export const generalConcatPagination = () => ({
  read: (existing) => existing,
  merge: (existing, incoming) => {
    return !existing
      ? {
          __typename: incoming.__typename,
          datalist: [...incoming.datalist],
          pageInfo: { ...incoming.pageInfo },
        }
      : {
          __typename: incoming.__typename,
          datalist: [...existing.datalist, ...incoming.datalist],
          pageInfo: { ...incoming.pageInfo },
        };
  },
  keyArgs: false,
});
