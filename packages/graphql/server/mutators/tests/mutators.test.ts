import {
  createMutator,
  updateMutator,
  deleteMutator,
  performMutationCheck,
} from "@vulcanjs/crud/server";

import { modifierToData } from "@vulcanjs/crud/server";
import { Connector } from "@vulcanjs/crud/server";
import { createGraphqlModelServer } from "@vulcanjs/graphql/server";

const guestsPermissions = {
  type: String,
  canCreate: ["guests"],
  canUpdate: ["guests"],
  canRead: ["guests"],
};
const membersPermissions = {
  canCreate: ["members"],
  canUpdate: ["members"],
  canDelete: ["members"],
};
const schema = {
  _id: {
    type: String,
    canRead: ["guests"],
    optional: true,
  },
  foo2: guestsPermissions,
  // generated by a callback
  after: Object.assign(guestsPermissions, { required: false }),
  // generated by onCreate/onUpdate
  publicAuto: {
    optional: true,
    type: String,
    canCreate: ["guests"],
    canRead: ["guests"],
    canUpdate: ["guests"],
    onCreate: () => {
      return "CREATED";
    },
    onUpdate: () => {
      return "UPDATED";
    },
    onDelete: () => {
      return "DELETED";
    },
  },
  privateAuto: {
    optional: true,
    type: String,
    canCreate: ["admins"],
    canRead: ["admins"],
    canUpdate: ["admins"],
    onCreate: () => {
      return "CREATED";
    },
    onUpdate: () => {
      return "UPDATED";
    },
    onDelete: () => {
      return "DELETED";
    },
  },
};

const initTests = () => {
  const RawFoo = createGraphqlModelServer({
    schema,
    name: "Foo",
    graphql: { typeName: "Foo", multiTypeName: "Foos" },
    permissions: membersPermissions,
  });
  // hack to fix the typings and guarantee that connector is defined
  const Foo = RawFoo as typeof RawFoo & {
    //graphql: Required<Pick<typeof RawFoo["graphql"], "connector">>;
    crud: Required<Pick<typeof RawFoo["crud"], "connector">>;
  };
  Foo.crud.connector = {} as Connector;
  return { Foo };
};
const { Foo } = initTests();

const currentUser = { _id: "42" };

describe("graphql/resolvers/mutators", function () {
  const defaultArgs = {
    model: Foo,
    document: { foo2: "bar" },
    currentUser,
    validate: false,
  };
  const createArgs = {
    ...defaultArgs,
  };
  const updateArgs = {
    ...defaultArgs,
  };
  const defaultContext = {
    model: Foo,
  };

  describe("create, update and delete mutators", () => {
    // create fake context
    let defaultConnector: Partial<Connector>;
    beforeEach(() => {
      defaultConnector = {
        create: async () => "1", // returns the new doc id
        findOneById: async () => ({
          id: "1",
        }),
        findOne: async () => ({ id: "1" }),
        update: async () => ({ id: "1" }),
      };
      Foo.crud.connector = defaultConnector as Connector;
    });
    describe("create mutator", () => {
      test("can run createMutator", async function () {
        const { data: resultDocument } = await createMutator({
          ...createArgs,
          context: defaultContext,
          data: { foo: "bar" },
        });
        expect(resultDocument).toBeDefined();
      });
      test("create should not mutate the provided data", async () => {
        const data = { foo: "foo" };
        const dataOriginal = { ...data };
        await createMutator({
          ...createArgs,
          context: defaultContext,
          data,
        });
        expect(data).toEqual(dataOriginal);
      });
    });
    describe("update mutator", () => {
      test("update should not mutate the provided data", async () => {
        const data = { _id: "1", foo: "fooUpdate" };
        const dataOriginal = { ...data };
        await updateMutator({
          ...updateArgs,
          dataId: data._id,
          context: defaultContext,
          data,
        });
        expect(data).toEqual(dataOriginal);
      });
      test("update mutator should pass the right selector to get the current document taking dataId argument", async () => {
        const data = { _id: "1", foo: "fooUpdate" };
        Foo.crud.connector.findOne = jest.fn(async () => data);
        await updateMutator({
          ...updateArgs,
          dataId: data._id,
          context: defaultContext,
          data,
        });
        expect(Foo.crud.connector.findOne).toHaveBeenCalledWith({
          _id: "1",
        });
      });
      test("update mutator should pass the right selector to get the current document taking selector argument", async () => {
        const data = { _id: "1", foo: "fooUpdate" };
        Foo.crud.connector.findOne = jest.fn(async () => data);
        await updateMutator({
          ...updateArgs,
          selector: { _id: data._id },
          context: defaultContext,
          data,
        });
        expect(Foo.crud.connector.findOne).toHaveBeenCalledWith({
          _id: "1",
        });
      });
      test("update mutator should pass the right selector to get the current document taking input argument", async () => {
        const data = { _id: "1", foo: "fooUpdate" };
        Foo.crud.connector.findOne = jest.fn(async () => data);
        await updateMutator({
          ...updateArgs,
          input: { id: data._id, data },
          context: defaultContext,
        });
        expect(Foo.crud.connector.findOne).toHaveBeenCalledWith({
          _id: "1",
        });
      });
    });
  });
  describe("delete mutator and callbacks", () => {
    const initDeletionTest = () => {
      const { Foo } = initTests();
      const defaultConnector: Partial<Connector> = {
        create: async () => "1", // returns the new doc id
        findOneById: async () => ({
          id: "1",
        }),
        findOne: async () => ({ id: "1" }),
        update: async () => ({ id: "1" }),
        delete: async () => {
          return true;
        },
      };
      Foo.crud.connector = defaultConnector as Connector;
      // create fake context
      const defaultParams = {
        model: Foo,
        context: {},
        asAdmin: true, // bypass field restriction
      };
      return { defaultParams, Foo };
    };
    const { defaultParams } = initDeletionTest();
    test("refuse deletion if selector is empty", async () => {
      const emptySelector = {};

      await expect(
        deleteMutator({ ...defaultParams, selector: emptySelector })
      ).rejects.toThrow();
    });
    test("refuse deletion if document is not found", async () => {
      const { Foo, defaultParams } = initDeletionTest();
      jest.spyOn(console, "error").mockImplementationOnce(() => {}); // silences console.error
      const nullSelector = { documentId: null };
      Foo.crud.connector.findOne = async () => null;

      const params = {
        ...defaultParams,
      };

      await expect(
        deleteMutator({ ...params, selector: nullSelector })
      ).rejects.toThrow();
    });
    test("accept valid deletions", async () => {
      const { Foo, defaultParams } = initDeletionTest();
      const validIdSelector = { _id: "foobar" };
      const validDocIdSelector = { documentId: "foobar" };
      const validSlugSelector = { slug: "foobar" };
      const foo = { hello: "world" };

      Foo.crud.connector.findOne = async () => foo;
      Foo.crud.connector.delete = async () => true;

      const params = {
        ...defaultParams,
        currentUser,
      };

      await expect(
        deleteMutator({ ...params, selector: validIdSelector })
      ).resolves.toEqual({ data: foo });
      await expect(
        deleteMutator({ ...params, selector: validDocIdSelector })
      ).resolves.toEqual({ data: foo });
      await expect(
        deleteMutator({ ...params, selector: validSlugSelector })
      ).resolves.toEqual({ data: foo });
    });

    test("pass the right id to get the current document", async () => {
      const { defaultParams, Foo } = initDeletionTest();
      const data = { _id: "1", foo: "fooUpdate" };
      Foo.crud.connector.findOne = jest.fn(async () => data);
      await deleteMutator({
        ...defaultParams,
        currentUser,
        dataId: "1",
      });
      expect(Foo.crud.connector.findOne).toHaveBeenCalledWith({
        _id: "1",
      });
    });
  });

  describe("field onCreate/onUpdate callbacks", () => {
    const { Foo } = initTests();
    Foo.crud.connector.create = async (data) => ({
      ...data, // preserve provided data => this is needed to test the callbacks
      id: "1",
    });
    Foo.crud.connector.findOne = async () => ({
      id: "1",
      foo2: "bar",
    });
    Foo.crud.connector.update = async (selector, modifier) => ({
      id: "1",
      ...modifierToData(modifier), // we need to preserve the existing document
    });
    const defaultArgs = {
      model: Foo,
      document: { foo2: "bar" },
      validate: false,
      // we test while being logged out
      asAdmin: false,
      currentUser,
    };
    const createArgs = {
      ...defaultArgs,
    };
    const updateArgs = {
      ...defaultArgs,
    };
    test("run onCreate callbacks during creation and assign returned value", async () => {
      const { data: resultDocument } = await createMutator({
        ...createArgs,
        data: { foo2: "bar" },
      });
      expect(resultDocument.publicAuto).toEqual("CREATED");
    });
    test("run onUpdate callback during update and assign returned value", async () => {
      const { data: foo } = await createMutator({
        ...createArgs,
        data: { foo2: "bar" },
      });
      const { data: resultDocument } = await updateMutator({
        ...updateArgs,
        selector: { _id: foo._id },
        data: { foo2: "update" },
      });
      expect(resultDocument.publicAuto).toEqual("UPDATED");
    });

    test("keep auto generated private fields ", async () => {
      const { data: resultDocument } = await createMutator({
        ...defaultArgs,
        data: { foo2: "bar" },
      });
      expect(resultDocument.privateAuto).not.toBeDefined();
    });
    test("keep auto generated private fields during update ", async () => {
      const { data: resultDocument } = await updateMutator({
        ...defaultArgs,
        dataId: "1",
        data: { foo2: "update" },
      });
      expect(resultDocument.privateAuto).not.toBeDefined();
    });
  });
  describe("ownership", () => {
    test("add userId if currentUser is defined and schema accept it", async () => {
      const schema = {
        _id: {
          type: String,
        },
        userId: {
          type: String,
          canRead: ["guests"],
        },
      };
      const RawFoo = createGraphqlModelServer({
        schema,
        name: "Foo",
        graphql: { typeName: "Foo", multiTypeName: "Foos" },
        permissions: membersPermissions,
      });
      // hack to fix the typings and guarantee that connector is defined
      const Foo = RawFoo as typeof RawFoo & {
        crud: Required<Pick<typeof RawFoo["crud"], "connector">>;
      };
      Foo.crud.connector = {} as Connector;

      const currentUser = { _id: "42" };
      Foo.crud.connector.create = async (data) => ({ _id: 1, ...data });
      const { data: resultDocument } = await createMutator({
        ...defaultArgs,
        model: Foo,
        currentUser,
        data: {},
      });
      expect(resultDocument.userId).toEqual("42");
    });
  });
  describe("permissions and validation", () => {
    const initPermissionTests = () => {
      const { Foo } = initTests();
      Foo.crud.connector = {
        ...Foo.crud.connector,
        create: async (data) => ({
          ...data, // preserve provided data => this is needed to test the callbacks
          id: "1",
        }),
        findOne: async () => ({
          id: "1",
          foo2: "bar",
        }),
        update: async (selector, modifier) => ({
          id: "1",
          ...modifierToData(modifier), // we need to preserve the existing document
        }),
        delete: async () => true,
      };
      const defaultArgs = {
        model: Foo,
        document: { foo2: "bar" },
        validate: false,
        // we test while being logged out
        asAdmin: false,
        currentUser,
      };
      return { Foo, defaultArgs };
    };
    const { Foo, defaultArgs } = initPermissionTests();
    describe("fields filtering", () => {
      test("filter out non allowed field before returning new document", async () => {
        const { data: resultDocument } = await createMutator({
          ...defaultArgs,
          data: { foo2: "bar" },
        });
        expect(resultDocument.privateAuto).not.toBeDefined();
      });
      test("filter out non allowed field before returning updated document", async () => {
        const { data: foo } = await createMutator({
          ...defaultArgs,
          data: { foo2: "bar" },
        });
        const { data: resultDocument } = await updateMutator({
          ...defaultArgs,
          selector: { _id: foo._id },
          data: { foo2: "update" },
        });
        expect(resultDocument.privateAuto).not.toBeDefined();
      });
      test("filter out non allowed field before returning deleted document", async () => {
        const { data: foo } = await createMutator({
          ...defaultArgs,
          data: { foo2: "bar" },
        });
        const { data: resultDocument } = await deleteMutator({
          ...defaultArgs,
          selector: {
            documentId: foo._id,
          },
        });
        expect(resultDocument.privateAuto).not.toBeDefined();
      });
    });
    describe("schema based validation", () => {
      const rawDocument = { foo2: "bar" };
      const expectedDocument = { foo2: "bar", publicAuto: "CREATED" };
      const { defaultArgs } = initPermissionTests();
      test("can create a valid document with no permission error", async () => {
        const { data: createdDocument } = await createMutator({
          ...defaultArgs,
          validate: true,
          data: rawDocument,
        });
        expect(createdDocument).toEqual(expectedDocument);
      });
    });
  });
});

const adminFoo = createGraphqlModelServer({
  schema,
  name: "adminFoo",
  graphql: { typeName: "adminFoo", multiTypeName: "adminFoos" },
  permissions: {
    canCreate: ["admins"],
    canUpdate: ["admins"],
    canDelete: ["admins"],
  },
});

describe("performMutationCheck", () => {
  test("throws a 'document not found' error if there is no document", () => {
    const errSpy = jest
      .spyOn(console, "error")
      .mockImplementationOnce(() => {}); // silences console.error
    expect(() =>
      performMutationCheck({
        model: Foo,
        document: undefined,
        operationName: "create",
      })
    ).toThrow(
      '[{"id":"app.document_not_found","data":{"operationName":"Foo:create"}}]'
    );
    expect(errSpy).toHaveBeenCalled();
  });
  test("throws an 'operation not allowed' if permission are set but user is not allowed", () => {
    const errSpy = jest
      .spyOn(console, "error")
      .mockImplementationOnce(() => {}); // silences console.error
    expect(() =>
      performMutationCheck({
        user: currentUser,
        model: adminFoo,
        document: {},
        operationName: "create",
      })
    ).toThrow(
      '[{"id":"app.operation_not_allowed","data":{"operationName":"adminFoo:create"}}]'
    );
    expect(errSpy).toHaveBeenCalled();
  });
});
