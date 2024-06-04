import React, { useState } from "react";

interface IMessageInput {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: IMessageInput) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form
      className="flex items-center justify-between mt-auto p-3 bg-white rounded-t-lg shadow"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Type your message here..."
        className="flex-1 outline-none p-2 border text-black rounded-md mr-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
