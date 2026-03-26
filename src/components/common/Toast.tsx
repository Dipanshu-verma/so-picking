"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={10}
      toastOptions={{
        duration: 3000,
        style: {
          fontSize: "15px",
          fontWeight: "600",
          borderRadius: "16px",
          padding: "14px 18px",
          maxWidth: "380px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
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