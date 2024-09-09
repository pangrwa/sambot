import { useConversation } from "@/hooks/useConversation";
import { Bot, CircleArrowDown } from "lucide-react";
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
    // auto scroll to the bottom
    handleScrollButtonClick();
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
          color: "black",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: showScrollButton ? 1 : 0,
          pointerEvents: showScrollButton ? "auto" : "none",
        }}
        onClick={handleScrollButtonClick}
      >
        <CircleArrowDown />
      </button>
    </div>
  );
}

function ChatMessage({ message, role }) {
  return (
    <div className="py-2 px-5 flex m-1">
        {role === 'user' ? (
            <div className="p-3 ml-auto bg-slate-200 rounded-xl">{message}</div>
        ) : (
            <div className="mr-auto"> 
              <Bot />
              <div className="p-3 self-start">{message}</div>
            </div>
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
      <div className="w-full p-5 flex flex-col items-center">
        <div className="h-[500px] w-full border-green border-2">
          <ScrollContainer>
            {conversations.map((message, index) => (
                <ChatMessage key={index} message={message.message} role={message.role}/>
            ))}
          </ScrollContainer>
        </div>
        <div className="pt-5">
            Clear Conversation
        </div>
      </div>
    </>
  );
}

export default ConversationInterface;
