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

    const connectInterval = setInterval(() => {
      if (!chatClient.isConnecting && !chatClient.isConnected) {
        console.warn("useChat not connected, reconnecting...");
        chatClient.reconnect();
      }
    }, 60_000);

    return () => {
      chatClient.removeListener(messageListener);
      chatClient.removeListener(disconnectListener);
      clearInterval(connectInterval);
      chatClient.quit();
    };
  }, [channels, onMessage]);

export default useChat;
