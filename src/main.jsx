import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AIProvider } from "./hooks/useAi.jsx";
import { ConversationProvider } from "./hooks/useConversation.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.jsx"
import FilePage from "./pages/FilePage.jsx";
import ConversationPage from "./pages/ConversationPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <ConversationPage />
      },
      {
        path: "/files",
        element: <FilePage />
      }
    ]
  }
]);

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <ConversationProvider>
      <AIProvider>
        <RouterProvider router={router} />
      </AIProvider>
    </ConversationProvider>
  // </StrictMode>,
);
