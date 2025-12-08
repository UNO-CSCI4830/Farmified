import React, { useState, useEffect, useRef } from "react";
import "./Messages.css";

export default function MessageScreen() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [input, setInput] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const messagesEndRef = useRef(null);

  const selected = conversations.find((c) => c.id === selectedId);

  // Load current user and conversations
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) return;

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);

    fetchConversations(parsedUser.email);
  }, []);

  // Polling for all conversations and messages
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      fetchConversations(currentUser.email);
    }, 2000); // poll every 2s
    return () => clearInterval(interval);
  }, [currentUser]);

  // Fetch all conversations and messages for sidebar updates
  async function fetchConversations(email) {
    try {
      const res = await fetch(`http://localhost:5001/api/conversations/${email}`);
      const data = await res.json();

      const convsWithMessages = await Promise.all(
        data.conversations.map(async (c) => {
          const messagesRes = await fetch(`http://localhost:5001/api/messages/${c.id}`);
          const messagesData = await messagesRes.json();

          const lastMessage = messagesData.messages[messagesData.messages.length - 1]?.message || c.lastMessage || "";

          // Determine the other participant
          const otherEmail = c.user1Email === email ? c.user2Email : c.user1Email;

          return {
            ...c,
            messages: messagesData.messages,
            lastMessage,
            updatedAt: messagesData.messages[messagesData.messages.length - 1]?.createdAt || c.updatedAt,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(otherEmail)}`,
            name: otherEmail,
          };
        })
      );

      // Sort by most recent message
      convsWithMessages.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setConversations(convsWithMessages);
    } catch (err) {
      console.error(err);
    }
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  async function handleAddUser() {
    const email = newUserEmail.trim();
    if (!email || !currentUser) return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/user/email/${encodeURIComponent(email)}`
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "User not found");
        return;
      }

      const { user } = await res.json();

      // Create or get conversation
      const convRes = await fetch(`http://localhost:5001/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user1Email: currentUser.email, user2Email: user.email }),
      });
      const convData = await convRes.json();

      const otherEmail = convData.conversation.user1Email === currentUser.email
        ? convData.conversation.user2Email
        : convData.conversation.user1Email;

      setConversations((prev) => [
        {
          ...convData.conversation,
          messages: [],
          lastMessage: "",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(otherEmail)}`,
          name: otherEmail,
        },
        ...prev.filter((c) => c.id !== convData.conversation.id),
      ]);
      setSelectedId(convData.conversation.id);
      setNewUserEmail("");
      setShowAddUser(false);
    } catch (err) {
      console.error(err);
      alert("Error adding user");
    }
  }

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !selected || !currentUser) return;

    const newMsg = { id: Date.now().toString(), senderEmail: currentUser.email, message: input };

    // Optimistic update
    setConversations((prev) =>
      prev
        .map((c) =>
          c.id === selected.id
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: input, updatedAt: new Date().toISOString() }
            : c
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // bump newest conversation to top
    );

    setInput("");

    // Send to backend
    fetch(`http://localhost:5001/api/messages/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderEmail: currentUser.email, message: newMsg.message }),
    }).catch(console.error);
  }

  return (
    <div className="message-screen">
      <aside className="sidebar2">
        <div className="sidebar-header">Messages</div>

        <div className="add-user-section">
          <button className="add-user-button" onClick={() => setShowAddUser((s) => !s)}>
            ➕ Add User
          </button>

          {showAddUser && (
            <div className="add-user-input">
              <input
                type="email"
                placeholder="Enter user email..."
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
              <button onClick={handleAddUser}>Add</button>
            </div>
          )}
        </div>

        <div className="conversation-list">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`conversation-item ${selectedId === c.id ? "active" : ""}`}
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
                  className={`message-row ${m.senderEmail === currentUser.email ? "from-me" : "from-them"}`}
                >
                  <div className={`message-bubble ${m.senderEmail === currentUser.email ? "me" : "them"}`}>
                    {m.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            <form onSubmit={handleSend} className="message-input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-button">Send</button>
            </form>
          </>
        ) : (
          <div className="empty-state">
            Select a conversation or add a user to start chatting.
          </div>
        )}
      </main>
    </div>
  );
}
