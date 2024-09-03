import InteractiveAvatar from "./InteractiveAvatar"
import InteractiveTextInput from "./InteractiveTextInput"

function ChatInterface() {
    return (
        <div className="bg-slate-700 p-4 rounded-xl flex flex-col gap-4">
            <InteractiveAvatar />
            <InteractiveTextInput />
        </div>
    )
}

export default ChatInterface;