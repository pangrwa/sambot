import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AIProvider } from "./hooks/useAi.jsx";
import { ConversationProvider } from "./hooks/useConversation.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ConversationProvider>
    <AIProvider>
      <App />
    </AIProvider>
  </ConversationProvider>
  // </StrictMode>,
);
