import React from "react";
import { render, screen, fireEvent, within} from "@testing-library/react";
import MessageScreen from "../Pages/Messages.js";


jest.mock("../Pages/Messages.css", () => ({}));

describe("MessageScreen", () => {
  test("sending a message adds it to Alice's message history", () => {
    render(<MessageScreen />);


    const header = screen.getByText("Active now").closest(".chat-header");
    expect(header).not.toBeNull();
    expect(within(header).getByText("Alice Johnson")).toBeInTheDocument();


    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Testing for Alice" } });


    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);


    const messageList = screen.getByRole("main").querySelector(".message-list");
    expect(messageList).not.toBeNull();
    expect(within(messageList).getByText("Testing for Alice")).toBeInTheDocument();


    const bobButton = screen.getByRole("button", { name: /bob smith/i });
    fireEvent.click(bobButton);
    expect(within(messageList).queryByText("Testing for Alice")).not.toBeInTheDocument();


    const aliceButton = screen.getByRole("button", { name: /alice johnson/i });
    fireEvent.click(aliceButton);
    expect(within(messageList).getByText("Testing for Alice")).toBeInTheDocument();
  });
});