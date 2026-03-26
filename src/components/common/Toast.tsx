"use client";

import { Toaster } from "react-hot-toast";

// Centralised toast configuration used across all pages.
// Import <AppToaster /> once per layout instead of
// repeating <Toaster ... /> config in every page file.
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          fontSize: "15px",
          fontWeight: "500",
          borderRadius: "12px",
          padding: "12px 16px",
          maxWidth: "360px",
        },
        success: {
          style: {
            background: "#f0fdf4",
            color: "#15803d",
            border: "1px solid #bbf7d0",
          },
          iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" },
        },
        error: {
          style: {
            background: "#fff1f2",
            color: "#b91c1c",
            border: "1px solid #fecdd3",
          },
          iconTheme: { primary: "#dc2626", secondary: "#fff1f2" },
          duration: 4000,
        },
      }}
    />
  );
}