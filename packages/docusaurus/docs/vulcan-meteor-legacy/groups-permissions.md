---
title: Groups & Permissions
---

## Debugging

**If you've got the [debug package](/debug.html) enabled, a groups debugging UI is available at [http://0.0.0.0:3000/debug/groups](http://0.0.0.0:3000/debug/groups).**

## Groups

Vulcan permissions work through user groups. There are two types of groups, **default groups** and **custom groups**. 

### Default Groups

Default groups exist out of the box for any Vulcan app, and they are *dynamic* in nature. In other words, a user is considered as belonging to these four groups based on a range of different factors. These groups are:

- `guests`: any **non-logged-in** user. In other words, any client connecting to your app, whether they are authentified or not. The only permissions usually assigned to this group are `read` permissions. 
- `members`: any **logged-in** user. This group will typically be able to `create` documents. 
- `owners`: any logged-in user that **is the owner of the current document** (which is determined by comparing a document's `userId` property with the current user's own `_id`).
- `admins`: any user with its `isAdmin` property set to `true`.

### Custom Groups

Unlike default groups, you have to explicitly define custom groups:

```
Users.createGroup('staff'); // create a new 'staff' group
```

You can then assign a group to a user by modifying their `groups` property (an array of group name strings), either through your app itself or in the database directly. 

Out of the box, custom groups don't do anything. You can check if a user belongs to any given group with:

```
Users.isMemberOf(currentUser, 'staff')
```

And then act based on the result. 

### Combining Groups

Note that a user can belong to more than one group. For example, a logged-in user from the `staff` group with the `isAdmin` set to true that is also the creator of the document being edited would be considered as belonging to the `members`, `owners`, `admins`, and `staff` groups at the same time. 

### The Admin Group

Note that the admin role will always make any permission check return `true`, and will also automatically be assigned to the first user that signs up on any new Vulcan app. 

## Document-level Permissions

The main way to define permissions in your app is through the `createCollection` function:

```
const Movies = createCollection({

  collectionName: 'Movies',

  typeName: 'Movie',

  schema,

  permissions: {
    canCreate: ['members'],
    canRead: ['members'],
    canUpdate: ['owners', 'admins'],
    canDelete: ['owners', 'admins'],
  },

});
```

The `createCollection` object takes a `permissions` property that itself takes four `canRead`, `canCreate`, `canUpdate`, and `canDelete` properties corresponding to the four basic CRUD operations. 

These properties can take either an array of group names that will be allowed to perform the operation as in the example above; or a function that returns `true` or `false`:

```
const Movies = createCollection({

  collectionName: 'Movies',

  //...

  permissions: {
    canCreate: options => { return true/false },
    canRead: options => { return true/false },
    canUpdate: options => { return true/false },
    canDelete: options => { return true/false },
  },

});
```

The `options` object has the following properties:

- `user`
- `document` (except for `canCreate`)
- `collection`
- `context` (note: only available when permission check is called from server)
- `operationName`

### The Owners Group

The `owners` group is a little special in that it's the only group that acts on specific documents. In other words, whereas defining `canRead: ['staff']` will allow access to *any* document in the collection to the `staff` group wholesale, specifying `canRead: ['owners']` will filter document one by one to check their ownership relative to the current user. 

Also note that a document can only have one owner. If you need more granular permissions, you can use your own custom permission functions instead of relying on groups. 

### Checking Permissions

If you need to test if a user passes a permission check, you can do so using the following shortcuts:

- `Users.canCreate({ collection, user, context })`
- `Users.canUpdate({ collection, user, document, context })`
- `Users.canDelete({ collection, user, document, context })`

The `Users` object must be imported from `meteor/vulcan:users`.

## Field-level Permissions

Vulcan has two levels of permission checks: the document level, and the field level. 

Consider a scenario where a user can edit their own posts, but an admin can edit anybody's post. Now let's add the requirement that a user can only edit a post's `title` property, but an admin can also edit a post's `status`. 

First, as explained above, we'll need a **document-level** check to see if the current user can edit a given document. Next comes the second check: is the user trying to modify fields they don't have access to? This check lives at the field level, in the schema:

```js
title: {
  type: String,
  canRead: ['guests'],
  canCreate: ['members'],
  canUpdate: ['owners'],
},
status: {
  type: Number,
  canRead: ['guests'],
  canCreate: ['admins'],
  canUpdate: ['admins'],
},
```

The `canUpdate` property takes an array of the names of the groups that can edit a given field. For more fine-grained permissions `canRead`, `canCreate`, and `canUpdate` can also take a function that returns a boolean as argument.

Note that there is no `canDelete` field-level check because any user who has the ability to modify a field's value also has the ability to erase its contents.

Also, field-level checks will only proceed if the document-level check first passes. This means that while you can make them more restrictive (“regular users can edit their own posts, but only admins can edit a post's status”) you can't do the opposite (“only admins can edit posts, but regular users can edit a post's title”).

## Route Access

You can use groups as a way to define route-level permissions to limit access to certain pages. To do so, add an `access` property to your route definitions:

```js
const adminAccessOptions = {
  groups: ['admins'],
  redirect: '/log-in'
}

addRoute([
  {
    name: 'admin.posts',
    path: '/admin/posts',
    component: AdminPosts,
    layoutComponent: AdminLayout,
    access: adminAccessOptions,
  },
]);
```

This property accepts an object with the following properties:

- `groups`: an array of group names allowed to access the route.
- `check`: alternatively, a function that will be called on the `currentUser` and returns a boolean.
- `redirect`: the path to redirect the user to if they are not logged in.
- `redirectMessage`: the message to show to users when they are redirected (requires having the `Components.FlashMessages` component somewhere in your component tree). Defaults to the `app.please_sign_up_log_in` i18n string. 
- `failureComponent` or `failureComponentName`: a component (or a registered component name) that will be shown in place of the route's content if the user is logged in but isn't allowed to access the route. Defaults to the `app.no_access_permissions` i18n string.  
