import { validateData } from "../resolvers/validation";
import { runCallbacks } from "@vulcanjs/core";

import { throwError } from "../resolvers/errors";
import { ModelMutationPermissionsOptions } from "@vulcanjs/model";
import { VulcanGraphqlModelServer } from "../../typings";
import { deprecate } from "@vulcanjs/utils";
import { ContextWithUser } from "../resolvers/typings";
import { VulcanDocument } from "@vulcanjs/schema";
import { DefaultMutatorName, VulcanGraphqlModel } from "../../typings";
import { isMemberOf } from "@vulcanjs/permissions";
import { FilterableInput } from "@vulcanjs/crud";

type ValidateProperties = Partial<
  CreateMutatorProperties & UpdateMutatorProperties
>;
export interface CreateMutatorProperties {
  /**
   * Data passed to the create function
   */
  data: any;
  /**
   * Alias for data
   * (used for consistency with update, here input data === the database document)
   */
  document?: any;
  /**
   * Alias for data, used for consistency during data validation
   */
  originalDocument?: any;
  /**
   * Alias for data, used for consistency during data validation
   */
  originalData?: any;
  currentUser?: any;
  model?: VulcanGraphqlModel;
  context?: any;
  schema?: any;
}
export interface UpdateMutatorProperties {
  /**
   * Document retrieved from the database
   * (different from data)
   */
  document: any;
  /**
   * Input data passed to the update function = partial data
   * (different from document, which is the document in the database)
   */
  data: any;
  /**
   * For update mutation
   */
  originalData: any;
  originalDocument?: any;
  currentUser?: any;
  model?: VulcanGraphqlModel;
  context?: any;
  schema?: any;
}
/**
 * Throws if some data are invalid
 */
export const validateMutationData = async ({
  model,
  data,
  originalDocument,
  mutatorName,
  context,
  properties,
}: {
  model: VulcanGraphqlModelServer; // data model
  mutatorName: DefaultMutatorName;
  context: Object; // Graphql context
  properties: ValidateProperties; // TODO: add update/delete if they are different
  data?: any; // data to validate
  originalDocument?: VulcanDocument;
  validationFunction?: Function;
}): Promise<void> => {
  const { typeName } = model.graphql;
  // basic simple schema validation
  const simpleSchemaValidationErrors = validateData({
    document: data,
    originalDocument,
    model,
    context,
    mutatorName,
  });
  // custom validation
  const customValidationErrors = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.validate`,
    iterator: [],
    callbacks: model?.graphql?.callbacks?.[mutatorName]?.validate || [],
    args: [properties],
  });
  const validationErrors = [
    ...simpleSchemaValidationErrors,
    ...customValidationErrors,
  ];
  if (validationErrors.length) {
    throwError({
      id: "app.validation_error",
      data: { break: true, errors: validationErrors },
    });
  }
};

type OperationName = "create" | "update" | "delete";
const operationChecks: {
  [operationName in OperationName]: keyof ModelMutationPermissionsOptions;
} = {
  create: "canCreate",
  update: "canUpdate",
  delete: "canDelete",
};

interface MutationCheckOptions {
  user?: any | null;
  document?: VulcanDocument | null;
  model: VulcanGraphqlModel;
  operationName: OperationName;
  asAdmin?: boolean;
}

/*

Perform security check

*/
export const performMutationCheck = (options: MutationCheckOptions) => {
  const { user, document, model, operationName, asAdmin = false } = options;
  const { typeName } = model.graphql;
  const permissionsCheck = model.permissions?.[operationChecks[operationName]];
  let allowOperation = false;
  const fullOperationName = `${typeName}:${operationName}`;
  const documentId = document?._id;
  const data = { documentId, operationName: fullOperationName };
  // 1. if no permission has been defined, throw error
  if (!permissionsCheck) {
    throwError({ id: "app.no_permissions_defined", data });
  }
  // 2. if no document is passed, throw error
  if (!document) {
    throwError({ id: "app.document_not_found", data });
  }

  if (!asAdmin && typeof permissionsCheck === "function") {
    allowOperation = permissionsCheck(options);
  } else if (!asAdmin && Array.isArray(permissionsCheck)) {
    allowOperation = isMemberOf(user, permissionsCheck, document);
  }
  // 3. if permission check is defined but fails, disallow operation
  if (!asAdmin && !allowOperation) {
    throwError({ id: "app.operation_not_allowed", data });
  }
};

interface GetSelectorInput {
  context: ContextWithUser;
  model: VulcanGraphqlModelServer;
  dataId?: string;
  selector?: Object;
  input?: FilterableInput<VulcanDocument>;
}

/**
 * Get the selector, in the format that matches the relevant connector
 * (for instance Mongo)
 *
 * @deprecated 0.6
 */
export async function getSelector({
  dataId,
  selector,
  input,
  context,
  model,
}: GetSelectorInput) {
  if (dataId) {
    selector = { _id: dataId };
  } else if (selector) {
    deprecate(
      "0.2.3",
      "'selector' attribute of mutators is deprecated, use 'input' instead"
    );
    selector = selector;
  } else if (input) {
    const connector = model.graphql.connector;
    if (!connector)
      throw new Error(
        `Model ${model.name} has no graphql connector, cannot select a document.`
      );
    const filterParameters = await connector._filter(input, context);
    selector = filterParameters.selector;
  }
  return selector;
}
