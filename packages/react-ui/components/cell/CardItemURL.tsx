import React from "react";
import { useVulcanComponents } from "../VulcanComponents";

// URL
export const CardItemURL = ({ value, force }) => {
  const Components = useVulcanComponents();
  return force || value.slice(0, 4) === "http" ? (
    <a
      className="contents-link"
      href={value}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Components.CardItemString string={value} />
    </a>
  ) : (
    <Components.CardItemString string={value} />
  );
};
