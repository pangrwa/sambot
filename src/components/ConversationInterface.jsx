import { useConversation } from "@/hooks/useConversation";
import { useCallback, useEffect, useRef, useState } from "react";

function ScrollContainer({ children }) {
  const outerDiv = useRef(null);
  const innerDiv = useRef(null);
  const prevInnerDivHeight = useRef(null);
  const prevScrollTop = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // start the container at the bottom
  useEffect(() => {
    const outerHeight = outerDiv.current.clientHeight;
    const innerHeight = innerDiv.current.clientHeight;
    const outerDivScrollTop = outerDiv.current.scrollTop;

    if (
      !prevInnerDivHeight.current ||
      outerDivScrollTop == prevInnerDivHeight.current - outerHeight
    ) {
      outerDiv.current.scrollTo({
        top: innerHeight - outerHeight,
        left: 0,
        behavior: prevInnerDivHeight.current ? "smooth" : "auto",
      });
    } else {
      setShowScrollButton(true);
    }

    prevInnerDivHeight.current = innerHeight;
    prevScrollTop.current = outerDivScrollTop;
  }, [children]);

  useEffect(() => {
    const handleScroll = () => {
        const outerDivScrollTop = outerDiv.current.scrollTop;

        // check if the user scrolled upwards
        if (outerDivScrollTop < prevScrollTop.current) {
            setShowScrollButton(true);
        } else if (outerDivScrollTop === outerDiv.current.scrollHeight - outerDiv.current.clientHeight) {
            setShowScrollButton(false);
        }

        // update the previous scroll position 
        prevScrollTop.current = outerDivScrollTop;
    }

    const outerDivCurrent = outerDiv.current;
    outerDivCurrent.addEventListener("scroll", handleScroll);
    return () => {
        outerDivCurrent.removeEventListener("scroll", handleScroll);
    } 
  }, []);

  const handleScrollButtonClick = useCallback(() => {
    const outerDivHeight = outerDiv.current.clientHeight;
    const innerDivHeight = innerDiv.current.clientHeight;

    outerDiv.current.scrollTo({
      top: innerDivHeight - outerDivHeight,
      left: 0,
      behavior: "smooth",
    });

    setShowScrollButton(false);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
      }}
    >
      <div
        ref={outerDiv}
        style={{
          position: "relative",
          height: "100%",
          overflow: "scroll",
        }}
      >
        <div
          ref={innerDiv}
          style={{
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
      <button
        style={{
          position: "absolute",
          backgroundColor: "red",
          color: "white",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: showScrollButton ? 1 : 0,
          pointerEvents: showScrollButton ? "auto" : "none",
        }}
        onClick={handleScrollButtonClick}
      >
        New message!
      </button>
    </div>
  );
}

function ChatMessage({ message, role }) {
  return (
    <div className="py-2 px-5">
        {role === 'user' ? (
            <div className="p-2 bg-indigo-300">{message}</div>
        ) : (
            <div className="p-2 bg-red-200">{message}</div>
        ) }
    </div>
  );
}

function ConversationInterface() {
  const {conversations, getConversations} = useConversation();

  useEffect(() => {
    getConversations();
  }, []);

  return (
    <>
      <h1 className="text-xl">Conversation</h1>
      <div className="w-full border-black border-2 p-5 flex flex-col items-center">
        <div className="h-[500px] w-full border-green border-2">
          <ScrollContainer>
            {conversations.map((message, index) => (
                <ChatMessage key={index} message={message.message} role={message.role}/>
            ))}
          </ScrollContainer>
        </div>
        <div
          style={{
            marginTop: "8px",
          }}
        >
        </div>
      </div>
    </>
  );
}

export default ConversationInterface;
