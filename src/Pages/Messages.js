import React, { useState } from "react";
import "./Messages.css";

const mockConversations = [
  {
    id: "1",
    name: "Alice Johnson",
    lastMessage: "Hey there! How’s your day going?",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&q=80&auto=format&fit=crop",
    messages: [
      { id: "m1", fromMe: false, text: "Hey there! How’s your day going?" },
      { id: "m2", fromMe: true, text: "Pretty good! Working on a new project." },
    ],
  },
  {
    id: "2",
    name: "Bob Smith",
    lastMessage: "Let’s catch up soon!",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&auto=format&fit=crop",
    messages: [
      { id: "m1", fromMe: false, text: "Let’s catch up soon!" },
      { id: "m2", fromMe: true, text: "Definitely! How about Friday?" },
    ],
  },
];

export default function MessageScreen() {
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [input, setInput] = useState("");

  const selected = conversations.find((c) => c.id === selectedId);

  function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const newMsg = { id: Date.now().toString(), fromMe: true, text: trimmed };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: trimmed }
          : c
      )
    );
    setInput("");
  }

  return (
    <div className="message-screen">
      <aside className="sidebar">
        <div className="sidebar-header">Messages</div>
        <div className="conversation-list">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`conversation-item ${
                selectedId === c.id ? "active" : ""
              }`}
            >
              <img src={c.avatar} alt={c.name} className="avatar" />
              <div className="conversation-text">
                <div className="conversation-name">{c.name}</div>
                <div className="conversation-preview">{c.lastMessage}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="chat-area">
        {selected ? (
          <>
            <div className="chat-header">
              <img src={selected.avatar} alt={selected.name} className="avatar" />
              <div>
                <div className="chat-name">{selected.name}</div>
                <div className="chat-status">Active now</div>
              </div>
            </div>

            <div className="message-list">
              {selected.messages.map((m) => (
                <div
                  key={m.id}
                  className={`message-row ${m.fromMe ? "from-me" : "from-them"}`}
                >
                  <div className={`message-bubble ${m.fromMe ? "me" : "them"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="message-input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="empty-state">
            Select a conversation to start chatting.
          </div>
        )}
      </main>
    </div>
  );
}
