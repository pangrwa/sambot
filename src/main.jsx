import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AIProvider } from "./hooks/useAi.jsx";
import { ConversationProvider } from "./hooks/useConversation.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.jsx";
import FilePage from "./pages/FilePage.jsx";
import ConversationPage from "./pages/ConversationPage.jsx";
import { FileProvider } from "./hooks/useFiles.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <ConversationPage />,
      },
      {
        path: "/files",
        element: <FilePage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ConversationProvider>
    <FileProvider>
      <AIProvider>
        <RouterProvider router={router} />
      </AIProvider>
    </FileProvider>
  </ConversationProvider>
  // </StrictMode>,
);
