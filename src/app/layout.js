import "./globals.css";
import ReduxProvider from "./reduxProvider";
import { Toaster } from "sonner";

export const metadata = {
  title: "Invenzo - Inventory Management",
  description: "",
  icons: {
    icon: "/src/app/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <Toaster richColors position="top-right" />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
