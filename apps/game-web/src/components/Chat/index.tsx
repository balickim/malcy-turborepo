import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { IonSpinner } from "@ionic/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";

import { IMessageDto } from "~/api/chat/dtos";
import ChatApi from "~/api/chat/routes";
import MessageInput from "~/components/Chat/MessageInput";
import MessageList from "~/components/Chat/MessageList";
import store from "~/store";
import { ISendMessageData, websocketChat } from "~/store/websocketStore";

const Chat = () => {
  const { userStore } = store;
  const chatApi = new ChatApi();
  const [conversationId] = useState(1);
  const [messages, setMessages] = useState<IMessageDto[]>([]);

  const {
    data: messagesInConversation,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    refetchOnWindowFocus: false,
    initialPageParam: 1,
    queryKey: ["getMessagesInConversation", conversationId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await chatApi.getMessagesInConversation(
        conversationId,
        pageParam,
      );
      return {
        pages: response.data.messages,
        nextPage: response.data.nextPage,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    const allFetchedMessages =
      messagesInConversation?.pages.flatMap((page) => page.pages) || [];
    setMessages((currentMessages) => {
      const newMessageSet = new Map(currentMessages.map((msg) => [msg, msg]));
      allFetchedMessages.forEach((msg) => newMessageSet.set(msg, msg));
      return Array.from(newMessageSet.values());
    });
  }, [messagesInConversation]);

  useEffect(() => {
    websocketChat.socket?.on("newMessage", async (message: IMessageDto) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
      if (message.user.id !== userStore.user.id) {
        if (!Capacitor.isNativePlatform()) new Audio("notification.mp3").play();

        await LocalNotifications.schedule({
          notifications: [
            {
              title: `${message.user.username} napisał:`,
              body: `${message.content}`,
              id: 1,
              sound: undefined,
              attachments: undefined,
              actionTypeId: "",
              extra: null,
            },
          ],
        });
      }
    });
    websocketChat.socket?.on("error", (args) =>
      toast.error(args, { duration: 10000 }),
    );

    return () => {
      websocketChat.socket?.off("newMessage");
      websocketChat.socket?.off("error");
    };
  }, []);

  const sendMessageWrapper = (content: string) => {
    const data: ISendMessageData = {
      userId: userStore.user.id,
      content,
      conversationId,
    };
    return websocketChat.sendMessage("sendMessage", data);
  };

  return (
    <div className={"flex flex-col h-full justify-between"}>
      <div
        id="scrollableDiv"
        style={{
          height: 300,
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <InfiniteScroll
          dataLength={messages.length || 0}
          style={{ display: "flex", flexDirection: "column-reverse" }}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          loader={<IonSpinner />}
          scrollableTarget="scrollableDiv"
          inverse
        >
          <MessageList messages={messages} />
        </InfiniteScroll>
      </div>

      <MessageInput onSendMessage={sendMessageWrapper} />
    </div>
  );
};

export default Chat;
