/**
 * Generates the GraphQL schema and
 * the resolvers and mutations for a Vulcan collectio
 */
// import { getDefaultMutationResolvers } from "./defaultMutationResolvers";
// import { getDefaultQueryResolvers } from "./defaultQueryResolvers";
import { getSchemaFields, MutationDefinitionsMap } from "./schemaFields";
import {
  selectorInputTemplate,
  mainTypeTemplate,
  createInputTemplate,
  createDataInputTemplate,
  updateInputTemplate,
  updateDataInputTemplate,
  selectorUniqueInputTemplate,
  deleteInputTemplate,
  upsertInputTemplate,
  singleInputTemplate,
  multiInputTemplate,
  multiOutputTemplate,
  singleOutputTemplate,
  mutationOutputTemplate,
  singleQueryTemplate,
  multiQueryTemplate,
  createMutationTemplate,
  updateMutationTemplate,
  upsertMutationTemplate,
  deleteMutationTemplate,
  // enumTypeTemplate,
  fieldFilterInputTemplate,
  fieldSortInputTemplate,
  customFilterTemplate,
  // customSortTemplate, // not currently used
  //nestedInputTemplate,
} from "../templates";

import _isEmpty from "lodash/isEmpty";
import _initial from "lodash/initial";
import { VulcanGraphqlModel } from "../typings";
import { camelCaseify } from "@vulcanjs/utils";

/**
 * Extract relevant collection information and set default values
 * @param {*} collection
 */
// const getCollectionInfos = (collection) => {
//   const collectionName = collection.options.collectionName;
//   const typeName = collection.typeName
//     ? collection.typeName
//     : Utils.camelToSpaces(_initial(collectionName).join("")); // default to posts -> Post
//   const schema = collection.simpleSchema()._schema;
//   const description = collection.options.description
//     ? collection.options.description
//     : `Type for ${collectionName}`;
//   return {
//     ...collection.options,
//     collectionName,
//     typeName,
//     schema,
//     description,
//   };
// };
type Resolver = Function;
interface ResolverDefinition {
  description?: string;
  resolver: Resolver;
}
type ResolverMap = {
  [key in string]: Resolver;
};
interface CreateResolversInput {
  resolvers: {
    single: ResolverDefinition;
    multi: ResolverDefinition;
  };
  typeName: string;
  multiTypeName: string;
}
interface CreateResolversOutput {
  // Graphql typeDef
  queriesToAdd: Array<[string, string]>; // [query typedef, description]
  // Functions
  resolversToAdd: Array<{ Query: ResolverMap }>;
}
/**
 * Compute query resolvers for a given model
 */
const createResolvers = ({
  resolvers,
  typeName,
  multiTypeName,
}: CreateResolversInput): CreateResolversOutput => {
  const queryResolvers: ResolverMap = {};
  const queriesToAdd: Array<[string, string]> = [];
  const resolversToAdd: Array<{ Query: ResolverMap }> = [];
  if (resolvers === null) {
    // user explicitely don't want resolvers
    return { queriesToAdd, resolversToAdd };
  }
  // REMOVED FEATURE: if resolvers are empty, use defaults
  // => we expect user to provide default resolvers explicitely (or we compute them earlier, here it's too far)
  /*const resolvers = _isEmpty(providedResolvers)
    ? getDefaultQueryResolvers({ typeName })
    : providedResolvers;*/
  // single
  if (resolvers.single) {
    queriesToAdd.push([
      singleQueryTemplate({ typeName }),
      resolvers.single.description,
    ]);
    //addGraphQLQuery(singleQueryTemplate({ typeName }), resolvers.single.description);
    queryResolvers[camelCaseify(typeName)] = resolvers.single.resolver.bind(
      resolvers.single
    );
  }
  // multi
  if (resolvers.multi) {
    queriesToAdd.push([
      multiQueryTemplate({ typeName, multiTypeName }),
      resolvers.multi.description,
    ]);
    //addGraphQLQuery(multiQueryTemplate({ typeName }), resolvers.multi.description);
    queryResolvers[camelCaseify(multiTypeName)] = resolvers.multi.resolver.bind(
      resolvers.multi
    );
  }
  //addGraphQLResolvers({ Query: { ...queryResolvers } });
  resolversToAdd.push({ Query: { ...queryResolvers } });
  return {
    queriesToAdd,
    resolversToAdd,
  };
};

interface MutationResolver {
  description?: string;
  mutation: Function;
}
type MutationResolverMap = {
  [key in string]: MutationResolver;
};
interface CreateMutationsInput {
  mutations: {
    create: any;
    update: any;
    upsert: any;
    delete: any;
  };
  typeName: string;
  modelName: string;
  fields: MutationDefinitionsMap;
}
interface CreateMutationsOutput {
  mutationsToAdd: Array<[string, string]>;
  mutationsResolversToAdd: Array<{ Mutation: MutationResolverMap }>;
}
/**
 * Create mutation resolvers for a model
 */
const createMutations = ({
  mutations,
  typeName,
  modelName,
  fields,
}: CreateMutationsInput): CreateMutationsOutput => {
  const mutationResolvers: MutationResolverMap = {};
  const mutationsToAdd: CreateMutationsOutput["mutationsToAdd"] = [];
  const mutationsResolversToAdd: CreateMutationsOutput["mutationsResolversToAdd"] = [];
  if (mutations === null) {
    // user explicitely disabled mutations
    return { mutationsResolversToAdd, mutationsToAdd };
  }
  // WE EXPECT mutations to be passed now
  // if mutations are undefined, use defaults
  /*
  const mutations = _isEmpty(providedMutations)
    ? getDefaultMutationResolvers({ typeName })
    : providedMutations;
    */

  const { create, update } = fields;

  // create
  if (mutations.create) {
    // e.g. "createMovie(input: CreateMovieInput) : Movie"
    if (create.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        `// Warning: you defined a "create" mutation for model ${modelName}, but it doesn't have any mutable fields, so no corresponding mutation types can be generated. Remove the "create" mutation or define a "canCreate" property on a field to disable this warning`
      );
    } else {
      //addGraphQLMutation(createMutationTemplate({ typeName }), mutations.create.description);
      mutationsToAdd.push([
        createMutationTemplate({ typeName }),
        mutations.create.description,
      ]);
      mutationResolvers[`create${typeName}`] = mutations.create.mutation.bind(
        mutations.create
      );
    }
  }
  // update
  if (mutations.update) {
    // e.g. "updateMovie(input: UpdateMovieInput) : Movie"
    if (update.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        `// Warning: you defined an "update" mutation for model ${modelName}, but it doesn't have any mutable fields, so no corresponding mutation types can be generated. Remove the "update" mutation or define a "canUpdate" property on a field to disable this warning`
      );
    } else {
      mutationsToAdd.push([
        updateMutationTemplate({ typeName }),
        mutations.update.description,
      ]);
      //addGraphQLMutation(updateMutationTemplate({ typeName }), mutations.update.description);
      mutationResolvers[`update${typeName}`] = mutations.update.mutation.bind(
        mutations.update
      );
    }
  }
  // upsert
  if (mutations.upsert) {
    // e.g. "upsertMovie(input: UpsertMovieInput) : Movie"
    if (update.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        `// Warning: you defined an "upsert" mutation for model ${modelName}, but it doesn't have any mutable fields, so no corresponding mutation types can be generated. Remove the "upsert" mutation or define a "canUpdate" property on a field to disable this warning`
      );
    } else {
      mutationsToAdd.push([
        upsertMutationTemplate({ typeName }),
        mutations.upsert.description,
      ]);
      //addGraphQLMutation(upsertMutationTemplate({ typeName }), mutations.upsert.description);
      mutationResolvers[`upsert${typeName}`] = mutations.upsert.mutation.bind(
        mutations.upsert
      );
    }
  }
  // delete
  if (mutations.delete) {
    // e.g. "deleteMovie(input: DeleteMovieInput) : Movie"
    //addGraphQLMutation(deleteMutationTemplate({ typeName }), mutations.delete.description);
    mutationsToAdd.push([
      deleteMutationTemplate({ typeName }),
      mutations.delete.description,
    ]);
    mutationResolvers[`delete${typeName}`] = mutations.delete.mutation.bind(
      mutations.delete
    );
  }
  //addGraphQLResolvers({ Mutation: { ...mutationResolvers } });
  mutationsResolversToAdd.push({ Mutation: { ...mutationResolvers } });
  return { mutationsResolversToAdd, mutationsToAdd };
};

interface Fields {
  mainType: any;
  create: Array<any>;
  update: Array<any>;
  selector: any;
  selectorUnique: any;
  readable: Array<any>;
  filterable: Array<any>;
  // enums: Array<{ allowedValues: Array<any>; typeName: string }>;
}
interface GenerateSchemaFragmentsInput {
  model?: VulcanGraphqlModel;
  typeName?: string;
  description?: string;
  interfaces?: Array<any>;
  fields: Fields;
  isNested?: boolean;
}
// generate types, input and enums
const generateSchemaFragments = ({
  model,
  typeName: typeNameArgs,
  description,
  interfaces = [],
  fields,
  isNested = false,
}: GenerateSchemaFragmentsInput) => {
  const schemaFragments = [];
  const {
    mainType,
    create,
    update,
    selector,
    selectorUnique,
    //orderBy,
    readable,
    filterable,
    // enums,
  } = fields;

  const typeName = model ? model.graphql : typeNameArgs;

  if (!mainType || mainType.length === 0) {
    throw new Error(
      `GraphQL type ${typeName} has no fields. Please add readable fields or remove the type.`
    );
  }

  schemaFragments.push(
    mainTypeTemplate({ typeName, description, interfaces, fields: mainType })
  );

  /*
  FEATURE REMOVED enum do not work as expected
  if (enums) {
    for (const { allowedValues, typeName: enumTypeName } of enums) {
      schemaFragments.push(
        enumTypeTemplate({ typeName: enumTypeName, allowedValues })
      );
    }
  }
  */
  if (isNested) {
    // TODO: this is wrong because the mainType includes resolveAs fields
    // + this input type does not seem to be actually used?
    // schemaFragments.push(nestedInputTemplate({ typeName, fields: mainType }));

    //schemaFragments.push(deleteInputTemplate({ typeName }));
    //schemaFragments.push(singleInputTemplate({ typeName }));
    //schemaFragments.push(multiInputTemplate({ typeName }));
    //schemaFragments.push(singleOutputTemplate({ typeName }));
    //schemaFragments.push(multiOutputTemplate({ typeName }));
    //schemaFragments.push(mutationOutputTemplate({ typeName }));

    if (create.length) {
      schemaFragments.push(createInputTemplate({ typeName }));
      schemaFragments.push(
        createDataInputTemplate({ typeName, fields: create })
      );
    }

    if (update.length) {
      schemaFragments.push(updateInputTemplate({ typeName }));
      schemaFragments.push(upsertInputTemplate({ typeName }));
      schemaFragments.push(
        updateDataInputTemplate({ typeName, fields: update })
      );
    }
    if (filterable.length) {
      schemaFragments.push(
        fieldFilterInputTemplate({ typeName, fields: filterable })
      );
      schemaFragments.push(
        fieldSortInputTemplate({ typeName, fields: filterable })
      );
    }

    //   schemaFragments.push(selectorInputTemplate({ typeName, fields: selector }));

    //    schemaFragments.push(selectorUniqueInputTemplate({ typeName, fields: selectorUnique }));

    //    schemaFragments.push(orderByInputTemplate({ typeName, fields: orderBy }));
    return schemaFragments; // return now
  }
  schemaFragments.push(deleteInputTemplate({ typeName }));
  schemaFragments.push(singleInputTemplate({ typeName }));
  schemaFragments.push(multiInputTemplate({ typeName }));
  schemaFragments.push(singleOutputTemplate({ typeName }));
  schemaFragments.push(multiOutputTemplate({ typeName }));
  schemaFragments.push(mutationOutputTemplate({ typeName }));

  if (create.length) {
    schemaFragments.push(createInputTemplate({ typeName }));
    schemaFragments.push(createDataInputTemplate({ typeName, fields: create }));
  }

  if (update.length) {
    schemaFragments.push(updateInputTemplate({ typeName }));
    schemaFragments.push(upsertInputTemplate({ typeName }));
    schemaFragments.push(updateDataInputTemplate({ typeName, fields: update }));
  }

  if (filterable.length) {
    // TODO: reneable customFilters?
    const customFilters = undefined; //collection.options.customFilters;
    schemaFragments.push(
      fieldFilterInputTemplate({ typeName, fields: filterable, customFilters })
    );
    if (customFilters) {
      customFilters.forEach((filter) => {
        schemaFragments.push(customFilterTemplate({ typeName, filter }));
      });
    }
    // TODO: reenable customSorts
    const customSorts = undefined; // collection.options.customSorts;
    schemaFragments.push(
      fieldSortInputTemplate({ typeName, fields: filterable }) //, customSorts })
    );
    // TODO: not currently working
    // if (customSorts) {
    //   customSorts.forEach(sort => {
    //     schemaFragments.push(customSortTemplate({ typeName, sort }));
    //   });
    // }
  }

  schemaFragments.push(selectorInputTemplate({ typeName, fields: selector }));

  schemaFragments.push(
    selectorUniqueInputTemplate({ typeName, fields: selectorUnique })
  );

  return schemaFragments;
};
export const modelToGraphql = (model: VulcanGraphqlModel) => {
  let graphQLSchema = "";
  const schemaFragments = [];

  // const {
  //   collectionName,
  //   description,
  //   interfaces = [],
  //   resolvers,
  //   mutations,
  // } = getCollectionInfos(collection);
  const resolvers = null; // TODO: get from Model?
  const mutations = null; // TODO: get from Model?
  const { schema, name: modelName } = model;
  const { typeName, multiTypeName } = model.graphql;

  const {
    nestedFieldsList,
    fields,
    resolvers: schemaResolvers,
  } = getSchemaFields(schema, typeName);

  const { mainType } = fields;

  if (!mainType.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `// Warning: model ${model.name} doesn't have any GraphQL-enabled fields, so no corresponding type can be generated. Pass generateGraphQLSchema = false to createCollection() to disable this warning`
    );
    return { graphQLSchema };
  }
  schemaFragments.push(
    ...generateSchemaFragments({
      model,
      // description,
      // interfaces,
      fields,
      isNested: false,
    })
  );
  /* NESTED */
  // TODO: factorize to use the same function as for non nested fields
  // the schema may produce a list of additional graphQL types for nested arrays/objects
  if (nestedFieldsList) {
    for (const nestedFields of nestedFieldsList) {
      schemaFragments.push(
        ...generateSchemaFragments({
          typeName: nestedFields.typeName,
          fields: nestedFields.fields,
          isNested: true,
        })
      );
    }
  }

  const { queriesToAdd, resolversToAdd } = createResolvers({
    resolvers,
    typeName,
    multiTypeName,
  });
  const { mutationsToAdd, mutationsResolversToAdd } = createMutations({
    mutations,
    typeName,
    modelName,
    fields,
  });

  graphQLSchema = schemaFragments.join("\n\n") + "\n\n\n";

  return {
    graphQLSchema,
    queriesToAdd,
    schemaResolvers,
    resolversToAdd,
    mutationsToAdd,
    mutationsResolversToAdd,
  };
};

export default modelToGraphql;
