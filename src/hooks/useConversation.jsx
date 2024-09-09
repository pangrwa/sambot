import { createContext, useContext, useState } from "react";

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);

    async function getConversations() {
        try {
            console.log("Getting conversations...");
            const convoResponse = await fetch("/api/message/1");
            let convo = await convoResponse.json();
            convo = convo.map((m) => {
                return {
                    role: m.Role,
                    message: m.Message
                }
            });
            // handle some status errors...

            setConversations(convo);
        } catch (error) {
            console.error("Can't get conversation data: ", error.message);
        }
    }

    return (
        <ConversationContext.Provider value={{conversations, setConversations, getConversations}}>
            {children}
        </ConversationContext.Provider>
    );
};


export const useConversation = () => {
    const context = useContext(ConversationContext);
    return context;
}