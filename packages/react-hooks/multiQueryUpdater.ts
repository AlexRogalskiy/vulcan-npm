// /**
//  * Update cached list of data after a document creation
//  */
import { buildMultiQuery } from "./multi";
import { getVariablesListFromCache } from "./cacheUpdate";
// import { getApolloClient } from "@vulcan/next-apollo";
import debug from "debug";
import { VulcanGraphqlModel } from "@vulcan/graphql";
const debugApollo = debug("vn:apollo");

interface ComputeNewDataArgs {
  model: VulcanGraphqlModel;
  variables: { input: any };
  queryResult: Object;
  mutatedDocument: Object;
  multiResolverName: string;
}
export type ComputeNewDataFunc = (
  args: ComputeNewDataArgs
) => (Object | null) | Promise<Object | null>; // can be async or not

export const multiQueryUpdater = (computeNewData) => ({
  model,
  fragment,
  fragmentName,
  resolverName,
}: {
  model: VulcanGraphqlModel;
  fragment: string;
  fragmentName: string;
  resolverName: string;
}) => {
  // update multi queries
  const { typeName, multiTypeName, multiResolverName } = model.graphql;
  const multiQuery = buildMultiQuery({
    typeName,
    multiTypeName,
    fragmentName,
    fragment,
  });
  return async (cache, { data }) => {
    const mutatedDocument = data[resolverName].data;
    // @see https://github.com/VulcanJS/vulcan-npm/issues/7
    //const client = getApolloClient();
    // get all the resolvers that match
    const variablesList = getVariablesListFromCache(cache, multiResolverName); // TODO: mutli resolverName is wrong
    debugApollo(
      "Got variable list from cache",
      variablesList,
      "for resolverName",
      multiResolverName
    );
    // compute all necessary updates
    const multiQueryUpdates = (
      await Promise.all(
        variablesList.map(async (variables) => {
          try {
            const queryResult = cache.readQuery({
              query: multiQuery,
              variables,
            });
            const newData = await computeNewData({
              variables,
              model,
              queryResult,
              mutatedDocument,
              multiResolverName,
            });
            // check if the document should be included in this query, given the query filters
            if (newData) {
              return { query: multiQuery, variables, data: newData };
            }
            return null;
          } catch (err) {
            // could not find the query
            // TODO: be smarter about the error cases and check only for cache mismatch
            console.log(err);
          }
        })
      )
    ).filter((x) => !!x); // filter out null values
    // apply updates to the client
    multiQueryUpdates.forEach((update) => {
      debugApollo("Updating cache with query", update);
      cache.writeQuery(update); // NOTE: watched queries won't be updated
      // @see https://github.com/VulcanJS/vulcan-npm/issues/7
      // client.writeQuery(update);
    });
    // return for potential chainging
    return multiQueryUpdates;
  };
};
