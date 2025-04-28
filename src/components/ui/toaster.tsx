import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        duration: 5000,
        style: {
          background: "#fff", // white background
          color: "#000",      // black text
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
  );
} 