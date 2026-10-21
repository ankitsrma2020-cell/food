import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async event => { event.preventDefault(); setError(''); try { await login(form); nav('/'); } catch (err) { setError(err.message); } };
  return <AuthFrame title="Welcome back" subtitle="Sign in to see what’s happening"><form onSubmit={submit}>{error && <div className="alert error">{error}</div>}<input type="email" placeholder="Email" required value={form.email} onChange={event => setForm({ ...form, email: event.target.value })}/><input type="password" placeholder="Password" required value={form.password} onChange={event => setForm({ ...form, password: event.target.value })}/><button className="primary">Log in</button><div className="or"><span>OR</span></div><a className="forgot">Forgot password?</a></form><p className="switch">Don’t have an account? <Link to="/signup">Sign up</Link></p></AuthFrame>;
}

export function Signup() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const nav = useNavigate();
  const submit = async event => { event.preventDefault(); setError(''); try { await api('/auth/signup', { method: 'POST', body: JSON.stringify(form) }); setMessage('Account created — taking you to login...'); setTimeout(() => nav('/login'), 700); } catch (err) { setError(err.message); } };
  return <AuthFrame title="Create your account" subtitle="Join a community of curious people"><form onSubmit={submit}>{error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}<input placeholder="Full name" required value={form.fullName} onChange={event => setForm({ ...form, fullName: event.target.value })}/><input placeholder="Username" required value={form.username} onChange={event => setForm({ ...form, username: event.target.value })}/><input type="email" placeholder="Email" required value={form.email} onChange={event => setForm({ ...form, email: event.target.value })}/><input type="password" placeholder="Password (8+ characters)" minLength="8" required value={form.password} onChange={event => setForm({ ...form, password: event.target.value })}/><input type="password" placeholder="Confirm password" required value={form.confirmPassword} onChange={event => setForm({ ...form, confirmPassword: event.target.value })}/><button className="primary">Sign up</button><p className="legal">By signing up, you agree to our Terms and Privacy Policy.</p></form><p className="switch">Already have an account? <Link to="/login">Log in</Link></p></AuthFrame>;
}

function AuthFrame({ title, subtitle, children }) { return <div className="auth-page"><div className="auth-art"><div className="art-orb one"/><div className="art-orb two"/><div className="art-copy"><span className="eyebrow">A softer social space</span><h1>Share what<br/><i>matters.</i></h1><p>Made for the moments between the moments.</p></div></div><div className="auth-panel"><div className="auth-brand"><Camera size={25}/> <span>Instagram</span></div><div className="auth-box"><h2>{title}</h2><p>{subtitle}</p>{children}</div></div></div>; }
