"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

interface message {
  role: string;
  parts: {
    text: string;
  }[];
}

interface Todo {
  id: number;
  todo: string;
}

const page = () => {
  const [messages, setMessages] = useState<message[]>([]);
  const [input, setInput] = useState("");
  const [todoList, setTodoList] = useState([]);

  const refScroll = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (refScroll.current) {
      // scrollTop → The vertical position of the scrollbar inside the container
      refScroll.current.scrollTop = refScroll.current.scrollHeight;
    }
  }, [messages]); // Runs every time messages update

  const sendBtnClick = async () => {
    try {
      if (input === "") {
        return;
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", parts: [{ text: input }] },
      ]);
      setInput("");
      console.log("messages", messages);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/todos`,
        {
          message: input,
          history: messages,
        }
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "model",
          parts: [
            {
              text: response.data.message,
            },
          ],
        },
      ]);
      if (response.data.todos) {
        setTodoList(response.data.todos);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className=" flex flex-col-reverse sm:flex-row  min-h-screen justify-center items-center">
      {/* Chat Container */}
      <div
        ref={refScroll}
        className="w-full relative h-screen overflow-y-auto flex flex-col justify-start items-center border-t-2 sm:border-r-4 sm:border-t-0 border-gray-300"
      >
        <div className="w-full flex flex-col gap-8 justify-center items-center  pb-40 pt-8 px-4">
          {/* First message */}
          <div className={`flex w-full justify-start items-center`}>
            <span className="text-2xl">🤖</span>
            <p className="bg-[#2f7889] max-w-[70%] text-white p-4 rounded-2xl">
              Hello, I am your AI Todo Manager. How can I help you today?
            </p>
          </div>
          {messages.map((message, index) => (
            <div
              className={`flex w-full justify-start items-center ${
                message.role === "user" && " flex-row-reverse"
              }`}
            >
              {message.role === "user" ? (
                <span className="text-2xl">👦🏻</span>
              ) : (
                <span className="text-2xl">🤖</span>
              )}
              <p className="bg-[#2f7889] max-w-[70%] text-white p-4 rounded-2xl">
                {message.parts.map((part) => (
                  <span key={part.text}>{part.text}</span>
                ))}
              </p>
            </div>
          ))}
        </div>
        {/* input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendBtnClick();
          }}
          className="flex fixed bottom-10 justify-center items-center gap-3"
        >
          <input
            className="p-2 rounded-2xl outline-none border-2 bg-white text-black"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="py-2 px-4 bg-[#2f7889] text-white rounded-2xl"
          >
            Send
          </button>
        </form>
      </div>
      {/* Todo List Container */}
      <div className="w-full flex justify-center items-center relative">
        <div className="absolute -top-10  w-50 h-50 rounded-full"></div>
        <div className="w-full flex flex-col gap-8 justify-center items-center text-black pb-40 pt-8 px-4">
          <ul className="list-disc flex flex-col gap-4">
            {todoList.map((todo: Todo) => (
              <li className="p-4 min-w-40 shadow-white shadow-2xl bg-white  rounded-2xl">
                ID: {todo.id} - {todo.todo}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default page;
