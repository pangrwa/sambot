import { createContext, useContext, useState } from "react";
import { useConversation } from "./useConversation";

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [aiResponse, setAiResponse] = useState("");
  const { setConversations } = useConversation();

  async function generateAIResponse(question) {
    try {
      console.log("Requesting response from AI: ", question);
      const aiResponse = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": 'application/text'
        },
        body: question
      })
      let aiMessage;
      if (!aiResponse.ok) {
        aiMessage = "I am currently unable to answer your question."
      } else {
        aiMessage = await aiResponse.text(); 
      }
      setAiResponse(aiMessage);
      setConversations((prevConversations) => [...prevConversations, {
        role: 'assistant',
        message: aiMessage
      }]);
    } catch (error) {
      console.error("AI is not responding: ", error);
    }
  }
  return (
    <AIContext.Provider value={{aiResponse, setAiResponse, generateAIResponse}}>
      {children}
    </AIContext.Provider>
  );
};

export const useAi = () => {
  const context = useContext(AIContext);
  return context;
};
