import { ChatClient, type ChatMessage } from "@twurple/chat";
import { useEffect } from "react";

const useChat = (
  channels: string[],
  onMessage: (message: ChatMessage) => void,
) =>
  useEffect(() => {
    const chatClient = new ChatClient({
      channels,
      rejoinChannelsOnReconnect: true,
    });
    chatClient.connect();

    const messageListener = chatClient.onMessage(
      (_channel: string, _user: string, _text: string, msg: ChatMessage) => {
        onMessage(msg);
      },
    );

    const disconnectListener = chatClient.onDisconnect((manually, reason) => {
      console.error("useChat disconnected", { manually, reason });
      chatClient.reconnect();
    });

    return () => {
      chatClient.removeListener(messageListener);
      chatClient.removeListener(disconnectListener);
      chatClient.quit();
    };
  }, [channels, onMessage]);

export default useChat;
