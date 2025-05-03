import React from "react";
import NotesGrid from "./NotesGrid";

/**
 * Wrapper component for NotesGrid to be used with Astro client:load directive
 * This allows proper hydration of the React component in the Astro page
 */
const NotesGridWrapper: React.FC = () => {
  return <NotesGrid />;
};

export default NotesGridWrapper;
