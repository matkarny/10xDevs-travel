import React from "react";
import { ToastContainer as ReactToastifyContainer } from "../ui/Toast";

/**
 * Główny komponent ToastContainer dla całej aplikacji
 */
const ToastContainer: React.FC = () => {
  return <ReactToastifyContainer className="mt-16" />;
};

export default ToastContainer;
