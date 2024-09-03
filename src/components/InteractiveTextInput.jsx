import { useRef, useState } from "react";
import { useAi } from "../hooks/useAi";

function InteractiveTextInput() {
  const input = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const { generateAIResponse } = useAi();

  function handleInput(event) {
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
    if (event.target.style.height > 160) {
      event.target.style.height = "auto";
    }
    setContent(event.target.value);
  }

  function sendMessage() {
    setIsLoading(true);
    generateAIResponse(content);
    input.current.value = "";
    input.current.style.height = "auto";
    setContent("");
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex justify-center items-center gap-4">
        <textarea
          className="w-full resize-none max-h-40 overflow-y-auto bg-white bg-opacity-30 rounded-lg p-3"
          placeholder="Type a message..."
          onInput={handleInput}
          ref={input}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              e.preventDefault(); // prevent new line
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className={`bg-white bg-opacity-30 hover:bg-slate-900 text-white p-4 px-4 font-semibold uppercase rounded-md ${
            isLoading || !content.trim() ? "cursor-not-allowed opacity-30" : ""
          }`}
          disabled={isLoading || !content.trim() }
        >
          Send
        </button>
      </div>
    </>
  );
}

export default InteractiveTextInput;
