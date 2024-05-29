import dayjs from "dayjs";
import React from "react";

import { IMessageDto } from "~/api/chat/dtos";

interface IMessageList {
  messages: IMessageDto[];
}

const MessageList = ({ messages }: IMessageList) => {
  return (
    <>
      {messages.map((message, index) => (
        <div key={index} className="bg-white p-2 m-2 shadow text-black">
          <span className={"block text-wrap"}>{message.content}</span>
          <span className={"flex justify-end gap-1 text-gray-500 text-sm"}>
            <p>{message.user?.username}</p>
            <p>{dayjs(message.createdAt).format("DD/MM/YYYY HH:mm")}</p>
          </span>
        </div>
      ))}
    </>
  );
};

export default MessageList;
