import { ChatClient, type ChatMessage } from "@twurple/chat";
import { useEffect } from "react";

const useChat = (
  channels: string[],
  onMessage: (message: ChatMessage) => void,
  onConnect?: () => void,
) =>
  useEffect(() => {
    const normalizedChannels = channels.map((c) => c.toLowerCase());
    const chatClient = new ChatClient({ channels: normalizedChannels });
    chatClient.connect();

    if (onConnect) {
      const connectedChannels: string[] = [];

      const listener = chatClient.onJoin((channel) => {
        connectedChannels.push(channel.toLowerCase().replace(/^#/, ""));
        checkConnected();
      });

      const checkConnected = () => {
        if (!chatClient.isConnected) return;
        if (connectedChannels.length !== normalizedChannels.length) return;
        if (
          connectedChannels.some(
            (c) => !normalizedChannels.includes(c.toLowerCase()),
          )
        )
          return;

        chatClient.removeListener(listener);
        onConnect();
      };
    }

    const onMessageListener = chatClient.onMessage(
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
      chatClient.removeListener(onMessageListener);
      chatClient.quit();
    };
  }, [channels, onMessage, onConnect]);

export default useChat;
