"use client";

import { useEffect } from "react";

/**
 * Suppresses unhandled runtime exceptions caused by third-party browser extensions
 * (e.g. password managers, translation tools, or grammar extensions)
 * so they don't trigger development error overlays or break React hydration.
 */
export function ExtensionErrorCatcher() {
  useEffect(() => {
    const isExtensionErrorString = (str: string) => {
      return (
        str.includes("chrome-extension://") ||
        str.includes("moz-extension://") ||
        str.includes("safari-extension://") ||
        str.includes("M_ID") ||
        str.includes("bis_skin_checked") ||
        str.includes("ResizeObserver loop")
      );
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const filename = event.filename || "";
      const message = event.message || "";
      const stack = event.error?.stack || "";

      if (isExtensionErrorString(filename) || isExtensionErrorString(message) || isExtensionErrorString(stack)) {
        event.preventDefault();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const stack = (reason && typeof reason === "object" && "stack" in reason ? (reason as any).stack : "") || "";
      const message = (reason && typeof reason === "object" && "message" in reason ? (reason as any).message : String(reason)) || "";

      if (isExtensionErrorString(message) || isExtensionErrorString(stack)) {
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
