import { ChatClient, type ChatMessage } from "@twurple/chat";
import { useEffect } from "react";

const useChat = (
  channels: string[],
  onMessage: (message: ChatMessage) => void,
) =>
  useEffect(() => {
    const chatClient = new ChatClient({ channels });
    chatClient.connect();

    const messageListener = chatClient.onMessage(
      async (
        _channel: string,
        _user: string,
        _text: string,
        msg: ChatMessage,
      ) => {
        onMessage(msg);
      },
    );

    return () => {
      chatClient.removeListener(messageListener);
      chatClient.quit();
    };
  }, [channels, onMessage]);

export default useChat;
