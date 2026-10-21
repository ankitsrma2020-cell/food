import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';

export default function Messages() {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { api('/messages/inbox').then(data => setConversations(data.conversations || [])).catch(err => setError(err.message)); }, []);
  const open = async conversation => {
    const other = String(conversation.sender?._id) === String(currentUser?.id || currentUser?._id) ? conversation.recipient : conversation.sender;
    const id = other?._id || other?.id;
    if (!id) return;
    try { const data = await api(`/messages/${id}`); setActive(data.user); setMessages(data.messages || []); } catch (err) { setError(err.message); }
  };
  const send = async event => {
    event.preventDefault(); if (!active || !text.trim()) return;
    try { const data = await api(`/messages/${active._id || active.id}`, { method: 'POST', body: JSON.stringify({ text }) }); setMessages(value => [...value, data.message]); setText(''); } catch (err) { setError(err.message); }
  };
  return <Layout><section className="page messages"><div className="messages-head"><h1>Messages</h1><Send size={21}/></div>{error && <div className="alert error">{error}</div>}<div className="messages-layout"><div className="conversation-list">{conversations.map(item => <button className="conversation" key={item._id} onClick={() => open(item)}><Avatar user={item.sender}/><div><b>{item.sender?.username || item.recipient?.username}</b><small>{item.text}</small></div></button>)}{!conversations.length && <p className="muted message-list-empty">No conversations yet. Find someone through Search.</p>}</div><div className="message-thread">{active ? <><header><Avatar user={active}/><b>{active.username}</b></header><div className="thread-body">{messages.map(message => <p className={String(message.sender?._id) === String(active._id) ? 'message-bubble received' : 'message-bubble sent'} key={message._id}>{message.text}</p>)}</div><form className="message-compose" onSubmit={send}><input value={text} onChange={event => setText(event.target.value)} placeholder="Message..." maxLength={2000}/><button className="send-button" aria-label="Send"><Send size={18}/></button></form></> : <div className="message-empty"><div className="message-icon"><Send/></div><h2>Your messages</h2><p>Choose a conversation to start chatting.</p></div>}</div></div></section></Layout>;
}
