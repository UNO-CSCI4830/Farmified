import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import MessageScreen from "../Pages/Messages.js";

jest.mock("../Pages/Messages.css", () => ({}));

describe("MessageScreen conversation switching", () => {
  test("switching between Alice and Bob updates the message list", () => {
    render(<MessageScreen />);


    const messageList = screen.getByRole("main").querySelector(".message-list");
    expect(messageList).not.toBeNull();


    expect(within(messageList).getByText("Hey there! How’s your day going?")).toBeInTheDocument();
    expect(within(messageList).getByText("Pretty good! Working on a new project.")).toBeInTheDocument();


    const bobButton = screen.getByRole("button", { name: /bob smith/i });
    fireEvent.click(bobButton);


    expect(within(messageList).getByText("Let’s catch up soon!")).toBeInTheDocument();
    expect(within(messageList).getByText("Definitely! How about Friday?")).toBeInTheDocument();


    expect(within(messageList).queryByText("Hey there! How’s your day going?")).not.toBeInTheDocument();
    expect(within(messageList).queryByText("Pretty good! Working on a new project.")).not.toBeInTheDocument();


    const aliceButton = screen.getByRole("button", { name: /alice johnson/i });
    fireEvent.click(aliceButton);


    expect(within(messageList).getByText("Hey there! How’s your day going?")).toBeInTheDocument();
    expect(within(messageList).getByText("Pretty good! Working on a new project.")).toBeInTheDocument();
  });
});