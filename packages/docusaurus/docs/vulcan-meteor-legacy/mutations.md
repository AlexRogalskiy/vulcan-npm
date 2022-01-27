---
title: Mutations
---

A mutation is very similar to a query. It receives a GraphQL request, decides what to do with it, and then returns some data. But because mutations can result in _changes_ to your data, they have their own special `Mutation` type to differentiate them.

## Mutation Steps

When talking about mutations, it's important to distinguish between the different elements that make up the overall process. For example, let's imagine that a user submits a form for creating a new document. 

1. First, this will **trigger a request** to your GraphQL endpoint, sent by Apollo Client. You can do this either by writing your own mutation higher-order component, or by using one of Vulcan's [pre-made mutation HoCs](#Mutation-Higher-Order-Components). 
2. When the GraphQL endpoint receives this request, it will look for a corresponding **mutation resolver**. Again you can either code your own resolver, or use Vulcan's [default mutations](#Default-Mutation-Resolvers).
3. The mutation resolver then calls a **mutator**. The mutator is the function that does the actual job of validating the request and mutating your data. The reason for this additional layer is that you'll often want to mutate data for *outside* your GraphQL API. By extracting that logic you're able to call the same exact mutator function whether you're inserting a new document sent by the front-end or, say, seeding your database with content extracted from an API. As usual, Vulcan offers a set of [default mutators](#Default-Mutators).
4. Finally, the mutator calls a [database connector](/database.html#Connectors) to perform the actual database operation. By abstracting out the database operation, we're able to make mutators (and by extension your entire GraphQL API) database-agnostic. This means that you can switch from MongoDB to MySQL without having to modify any of the above three layers. 

## API

All mutations follow the "single argument" rule. In other words, they all have a single `input` argument which then contains one or more of the following nested arguments: 

- `filter`: a `filter` object (see [filtering](/filtering.html)) used to target the document to mutate.
- `id`: an alternate way to directly specify the `id` of the document to mutate.  
- `data`: the mutation data.

The mutations then all return a `data` object which contains the mutated document (note that the name of that property is always `data` no matter the returned document's type).

### Create Mutation

Supported input arguments: `data`.

Generated type:

```
createMovie(input: CreateMovieInput) : MovieMutationOutput
```

Example mutation: 

```
query testCreate {
  createMovie(input: { data: { name: "Die Hard", year: 1987 } }) {
    _id
    name
    year
  }
}
```

### Update Mutation

Supported input arguments: `filter`, `id`, `data`.

Generated type:

```
updateMovie(input: UpdateMovieInput ) : MovieMutationOutput
```

Example mutation: 

```
query testUpdate1 {
  updateMovie(input: { filter: { name: { _eq: "Die Hard" } }, data: { year: 1988 } }) {
    _id
    name
    year
  }
}
```

or


```
query testUpdate2 {
  updateMovie( input: { id: "foo123", data: { year: 1988 } }) {
    _id
    name
    year
  }
}
```

### Upsert Mutation

Supported input arguments: `filter`, `id`, `data`.

Generated type:

```
upsertMovie(input: UpsertMovieInput ) : MovieMutationOutput
```

Example mutation: 

```
query testUpsert {
  upsertMovie(input: { filter: { name: { _eq: "Die Hard" }, data: { name: "Die Hard", year: 1988 } }) {
    _id
    name
    year
  }
}
```

### Delete Mutation

Supported input arguments: `filter`, `id`.

Generated type:

```
deleteMovie(input: MovieDeleteInput) : MovieMutationOutput
```

Example mutation: 

```
query testDelete1 {
  deleteMovie(input: { filter: { name: { _eq: "Die Hard" } }) {
    _id
    name
    year
  }
}
```

or


```
query testDelete2 {
  deleteMovie( input: {id: "foo123" }) {
    _id
    name
    year
  }
}
```

## Client

### Hooks

#### useCreate

```js
import React, { useState } from 'react';
import { Components, useCreate2 } from 'meteor/vulcan:core';

const CreatePost = () => {
  const [createPost, { called, loading }] = useCreate2({ collectionName: 'Posts', fragmentName: 'PostFragment' });
  const [error, setError] = useState();

  return (
    <div>
      {error ? (
        <Components.FormErrors errors={getErrors(error)} />
      ) :
      loading ? (
        <Components.Loading />
      ) : called ? (
        <p>Thanks for submitting a post!</p>
      ) : (
        <Components.Button
          onClick={async () => {
            try {
              const input = { data: { title: 'My post title', body: 'My post body', url: 'https://myurl.com' } };
              await createPost({ input });
            } catch (error) {
              setError(error);
            }
          }}
        >
          Submit Post
        </Components.Button>
      )}
    </div>
  );
};

export default CreatePost;
```

#### useUpdate

```js
import React, { useState } from 'react';
import { Components, useUpdate2 } from 'meteor/vulcan:core';

const UpdatePost = () => {
  const [updatePost, { called, loading }] = useUpdate2({ collectionName: 'Posts', fragmentName: 'PostFragment' });
  const [error, setError] = useState();

  return (
    <div>
      {error ? (
        <Components.FormErrors errors={getErrors(error)} />
      ) :
      loading ? (
        <Components.Loading />
      ) : called ? (
        <p>Thanks for udpating a post!</p>
      ) : (
        <Components.Button
          onClick={async () => {
            try {
              const input = {
                id: 'foo123',
                data: { title: 'My post title2', body: 'My post body', url: 'https://myurl.com/2' },
              };
              await updatePost({ input });
            } catch (error) {
              setError(error);
            }
          }}
        >
          Update Post
        </Components.Button>
      )}
    </div>
  );
};

export default UpdatePost;
```

#### useDelete

TODO

### Higher-Order Components

Vulcan includes three main default hooks and higher-order components to make calling mutations from your React components easier. Note that when using the [Forms](forms.html) module, all three mutation HoCs are automatically added for you.

Both hooks and HOCs are based on Apollo [`useMutation` hook](https://www.apollographql.com/docs/react/api/react-hooks/#usemutation) and thus have a similar API and behaviour.

#### `useCreate` and `withCreate`

Both take the following options:

* `collection`: the collection to operate on.
* `fragment`: specifies the data to ask for as a return value.
* `mutationOptions`: option object passed down to the underlying Apollo [`useMutation`](https://www.apollographql.com/docs/react/api/react-hooks/#usemutation) hook

The HOC passes on a `createMovie` (or `createPost`, `createUser`, etc.) function to the wrapped component, which takes a single `document` argument.

The hook behaves similarly as Apollo [`useMutation` hook](https://www.apollographql.com/docs/react/api/react-hooks/#usemutation). It returns an array whose first item is the `createMovie` callback.

```js
const [createMovie] = useCreate(options)
```

Takes an object as argument with a single `data` property and returns a promise:

```js
this.props
  .createMovie({ data })
  .then(/* success */)
  .catch(/* error */);
```

#### `useUpdate` and `withUpdate`

Same options as `withCreate`. The returned `updateMovie` mutation takes three arguments: `filter`, `_id`, and `data`:

* `filter`: a `filter` input pointing to the document to modify. See the [filtering](filtering.html) section.
* `_id`: an `_id` used to identify a specific document (note that either `filter` or `_id` should be set).
* `data`: the fields to modify or delete (as a list of field name/value pairs with deleted fields set to `null`, e.g.`{title: 'My New Title', body: 'My new body', status: null}`).

```js
this.props
  .updateMovie({
    _id: 'foo123',
    data: { year: 2001 },
  })
  .then(/* success */)
  .catch(/* error */);
```

or

```js
this.props
  .updateMovie({
    filter: { name: { _in: ['Die Hard', 'Terminator 2'] } },
    data: { year: 1993 },
  })
  .then(/* success */)
  .catch(/* error */);
```

#### `useDelete` and `withDelete`

A single `collection` option. The returned `deleteMovie` mutation takes `filter` and `_id` arguments:

```js
this.props
  .deleteMovie({
    documentId,
  })
  .then(/* success */)
  .catch(/* error */);
```

#### `useRegisteredMutation` and `withMutation`

In addition to the three main mutation HoCs, The `withMutation` HoC provides an easy way to call a specific mutation on the server by letting you create ad-hoc mutation containers.

Note that the hook is called `useRegisteredMutation`, since `useMutation` is already the name of the underlying Apollo hook.

It takes these options:

* `name`: the name of the mutation to call on the server (will also be the name of the prop passed to the component).
* `args`: (optional) an object containing the mutation's arguments and types.
* `mutationOptions`: option object passed down to the underlying Apollo [`useMutation`](https://www.apollographql.com/docs/react/api/react-hooks/#usemutation) hook

For example, here's how to wrap the `MyComponent` component to pass it an `addEmailNewsletter` function as prop:

```js
const mutationOptions = {
  name: 'addEmailNewsletter',
  args: { email: 'String' }
};
withMutation(mutationOptions)(MyComponent);
```

You would then call the function with:

```
this.props.addEmailNewsletter({email: 'foo@bar.com'})
```
## Server

### Resolvers

Vulcan provides a set of default Create, Update, Upsert and Delete mutations you can use to save time:

```js
import {
  createCollection,
  getDefaultResolvers,
  getDefaultMutations
} from 'meteor/vulcan:core';
import schema from './schema.js';

const Movies = createCollection({
  typeName: 'Movie',

  schema,

  resolvers: getDefaultResolvers(options),

  mutations: getDefaultMutations(options)
});

export default Movies;
```

The `options` object can have the following properties: 

- `typeName` (String): the resolver's type name (required).
- `create` (Boolean): whether to create a `create` mutation (defaults to `true`).
- `update` (Boolean): whether to create a `update` mutation (defaults to `true`).
- `upsert` (Boolean): whether to create a `upsert` mutation (defaults to `true`).
- `delete` (Boolean): whether to create a `delete` mutation (defaults to `true`).

To learn more about what exactly the default mutations do, you can [find their code here](https://github.com/VulcanJS/Vulcan/blob/devel/packages/vulcan-core/lib/modules/default_mutations.js).

#### Custom Mutations

You can also add your own mutations resolvers using `addGraphQLMutation` and `addGraphQLResolvers`:

```js
import { addGraphQLMutation, addGraphQLResolvers } from 'meteor/vulcan:core';

addGraphQLMutation(
  'postsVote(documentId: String, voteType: String) : Post'
);

const voteResolver = {
  Mutation: {
    postsVote(root, { documentId, voteType }, context) {
      // do mutation
    }
  }
};

addGraphQLResolvers(voteResolver);
```

### Mutators

A **mutator** is the function that actually does the work of mutating data on the server. As opposed to the _mutation_, which is usually a fairly light function called directly through the GraphQL API, a _mutator_ will take care of the heavy lifting, including validation, callbacks, etc., and should be written in such a way that it can be called from anywhere: a GraphQL API, a REST API, from the server directly, etc.

#### Default Mutators

Vulcan features three standard mutators: `createMutator`, `updateMutator`, and `deleteMutator`. They are in essence thin wrappers around the standard Mongo `insert`, `update`, and `remove`.

These mutation functions should be defined _outside_ your GraphQL mutation resolvers, so that you're able to call them from outside a GraphQL context (for example, to seed your database through a server script).

They take the following arguments:

* `collection`: the collection affected.
* `document`: the document to mutate.
* `data`: (`updateMutator` only) the mutation payload.
* `currentUser`: the user performing the operation.
* `validate`: whether to validate the operation based on the current user.
* `context`: the resolver context.

If `validate` is set to `true`, these boilerplate operations will:

* Check that the current user has permission to insert/edit each field.
* Validate the document against collection schema.
* Add `userId` to document (insert only).
* Run any validation callbacks (e.g. `movies.new.validate`).

They will then run the mutation's document (or the `data` object) through the collection's sync callbacks (e.g. `movie.create.sync`), perform the operation, and finally run the async callbacks (e.g. `movie.create.async`).

For example, here is the `Posts` collection using the `createMutator` boilerplate mutator:

```js
createMutator({
  collection: context.Posts,
  document: document,
  currentUser: context.currentUser,
  validate: true,
  context
});
```

#### Mutator Callbacks

Default mutators create the following callback hooks for every collection: 

- `typename.operation.validate`: called to validate the document or modifier. 
- `typename.operation.before`: called before the database operation.
- `typename.operation.after`: called after the database operation, but before the mutator returns.
- `typename.operation.async`: called in an async manner after the mutator returns. 

You can learn more about callbacks in the [Callbacks](callbacks.html) section.

#### Custom Mutators

If you're writing your own resolvers you can of course also write your own mutators, either by using Vulcan's [Connectors](/database.html#Connectors) or even by accessing your database directly. 

One thing to be aware of though is that by doing this you'll bypass any callback hooks used by the default mutators, and you'll also have to take care of your own data validation. 
