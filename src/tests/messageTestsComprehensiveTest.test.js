import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import MessageScreen from "../Pages/Messages.js";

jest.mock("../Pages/Messages.css", () => ({}));

describe("MessageScreen - multiple users messaging", () => {
  test("sending messages to both users preserves each conversation upon switching", () => {
    render(<MessageScreen />);

 
    const getMessageList = () => screen.getByRole("main").querySelector(".message-list");


    let messageList = getMessageList();
    expect(messageList).not.toBeNull();

    const input = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "Hello Alice!" } });
    fireEvent.click(sendButton);


    expect(within(messageList).getByText("Hello Alice!")).toBeInTheDocument();


    const bobButton = screen.getByRole("button", { name: /bob smith/i });
    fireEvent.click(bobButton);

    messageList = getMessageList();

    fireEvent.change(input, { target: { value: "Hi Bob!" } });
    fireEvent.click(sendButton);

  
    expect(within(messageList).getByText("Hi Bob!")).toBeInTheDocument();


    const aliceButton = screen.getByRole("button", { name: /alice johnson/i });
    fireEvent.click(aliceButton);

    messageList = getMessageList();
  
    expect(within(messageList).getByText("Hello Alice!")).toBeInTheDocument();

    expect(within(messageList).queryByText("Hi Bob!")).not.toBeInTheDocument();


    fireEvent.click(bobButton);
    messageList = getMessageList();
    expect(within(messageList).getByText("Hi Bob!")).toBeInTheDocument();
    expect(within(messageList).queryByText("Hello Alice!")).not.toBeInTheDocument();
  });
});
