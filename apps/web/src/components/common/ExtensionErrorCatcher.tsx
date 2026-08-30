"use client";

import { useEffect } from "react";

/**
 * Suppresses unhandled runtime exceptions caused by third-party browser extensions
 * (e.g. password managers, translation tools, or grammar extensions)
 * so they don't trigger development error overlays or break React hydration.
 */
export function ExtensionErrorCatcher() {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const filename = event.filename || "";
      const message = event.message || "";
      const stack = event.error?.stack || "";

      const isExtensionError =
        filename.includes("chrome-extension://") ||
        filename.includes("moz-extension://") ||
        filename.includes("safari-extension://") ||
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://") ||
        message.includes("M_ID") ||
        message.includes("Cannot read properties of undefined (reading 'M_ID')") ||
        message.includes("ResizeObserver loop");

      if (isExtensionError) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const stack = (reason && typeof reason === "object" && "stack" in reason ? (reason as any).stack : "") || "";
      const message = (reason && typeof reason === "object" && "message" in reason ? (reason as any).message : String(reason)) || "";

      const isExtensionError =
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://") ||
        message.includes("M_ID") ||
        message.includes("Cannot read properties of undefined (reading 'M_ID')");

      if (isExtensionError) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("error", handleGlobalError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);

    return () => {
      window.removeEventListener("error", handleGlobalError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
    };
  }, []);

  return null;
}
