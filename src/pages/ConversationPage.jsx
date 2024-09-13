import AvatarInterface from "@/components/AvatarInterface";
import ConversationInterface from "@/components/ConversationInterface";

export default function ConversationPage() {
  return (
    <div className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-2">
      <div>
        <ConversationInterface />
      </div>
      <div className="col-span-1 justify-self-end">
        <div className="p-4 rounded-xl flex flex-col gap-4">
            <AvatarInterface />
        </div>
      </div>
    </div>
  );
}
