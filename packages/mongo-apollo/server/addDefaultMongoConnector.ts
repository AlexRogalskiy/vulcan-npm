import { VulcanGraphqlModelServer } from "@vulcanjs/graphql/server";
import {
  createMongooseConnector,
  MongooseConnectorOptions,
} from "@vulcanjs/mongo";
import { createMongooseDataSource } from "./createMongooseDataSource";
import { debugVulcan } from "@vulcanjs/utils";
const debugMongo = debugVulcan("mongo");

/**
 * Add default Mongo connector and dataSource to models
 *
 * For a custom behaviour, you can set the connector and createDataSource manually when creating your model
 * @param models
 * @returns
 */
export const addDefaultMongoConnector = (
  models: Array<VulcanGraphqlModelServer>,
  connectorOptions?: Pick<MongooseConnectorOptions, "mongooseInstance">
) => {
  models.forEach((model) => {
    if (!model.crud.connector) {
      debugMongo("Creating default mongoose connector for model", model.name);
      model.crud.connector = createMongooseConnector(model, connectorOptions);
    }
    if (!model.graphql.createDataSource) {
      debugMongo(
        "Creating default mongoose datasource maker for model",
        model.name
      );
      model.graphql.createDataSource = () =>
        createMongooseDataSource(model, model.crud.connector!);
    }
  });
  return models;
};
