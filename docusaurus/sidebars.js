/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  mainSidebar: [
    {
      type: "category",
      label: "Intro",
      link: { type: "doc", id: "guides/index" },
      items: [
        //"guides/index",
        "guides/get-started",

        /*{ type: "autogenerated", dirName: "guides" }*/
      ],
    },
    {
      type: "category",
      label: "Vulcan Next",
      link: { type: "doc", id: "vulcan-next/index" },
      items: [
        //"vulcan-next/index",
        "vulcan-next/get-started",
        "vulcan-next/codesandbox",
        {
          type: "category",
          label: "Features",
          items: [
            {
              type: "autogenerated",
              dirName: "vulcan-next/features",
            },
          ],
        },
        "vulcan-next/comparison",
        "vulcan-next/deploy",
        "vulcan-next/recipes",
        {
          type: "category",
          label: "For contributors",
          items: ["vulcan-next/contribute", "core/release-next"],
        },
        "vulcan-next/from-vulcan-v1",

        /*{ type: "autogenerated", dirName: "vulcan-next" }*/
      ],
    },
    {
      type: "category",
      label: "Vulcan Remix (alpha)",
      link: { type: "doc", id: "vulcan-remix/index" },
      items: [{ type: "autogenerated", dirName: "vulcan-remix" }],
    },
    {
      type: "category",
      label: "Vulcan Express (alpha)",
      link: { type: "doc", id: "vulcan-express/index" },
      items: [{ type: "autogenerated", dirName: "vulcan-express" }],
    },
    {
      type: "category",
      label: "Vulcan Meteor (legacy)",
      link: { type: "doc", id: "vulcan-meteor-legacy/index" },
      items: [{ type: "autogenerated", dirName: "vulcan-meteor-legacy" }],
    },
    {
      type: "category",
      label: "🔥Fire Engine",
      link: { type: "doc", id: "vulcan-fire/index" },
      items: [
        "vulcan-fire/get-started",
        "vulcan-fire/groups-permissions",
        "vulcan-fire/customTopLevelResolvers",
        "vulcan-fire/customFieldResolvers",
        "vulcan-fire/outsideGraphql",
      ],
    },
    {
      type: "category",
      label: "Core & contribute",
      link: { type: "doc", id: "core/contribute" },
      items: [{ type: "autogenerated", dirName: "core" }],
    },
  ],
  // But you can create a sidebar manually
};

module.exports = sidebars;
