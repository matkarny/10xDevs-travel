import { toast as reactToastify, ToastContainer as ReactToastifyContainer } from "react-toastify";

// Re-export toast and ToastContainer with nicer names
export const toast = reactToastify;
export const ToastContainer = ReactToastifyContainer;

// Helper functions to simplify toast usage with standard messages
export const showSuccessToast = (message: string) => {
  reactToastify.success(message);
};

export const showErrorToast = (message: string) => {
  reactToastify.error(message);
};

export const showInfoToast = (message: string) => {
  reactToastify.info(message);
};

export const showWarningToast = (message: string) => {
  reactToastify.warning(message);
};
