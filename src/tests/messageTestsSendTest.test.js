import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import MessageScreen from "../Pages/Messages.js";

jest.mock("../Pages/Messages.css", () => ({}));

describe("MessageScreen - sending messages", () => {
  test("sending a message to Alice adds it to her message history", () => {
    render(<MessageScreen />);


    const header = screen.getByText("Active now").closest(".chat-header");
    expect(header).not.toBeNull();
    expect(within(header).getByText("Alice Johnson")).toBeInTheDocument();


    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello Alice!" } });


    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);


    const messageList = screen.getByRole("main").querySelector(".message-list");
    expect(within(messageList).getByText("Hello Alice!")).toBeInTheDocument();
  });
});
