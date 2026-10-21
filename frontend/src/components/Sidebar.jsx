import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, Home, Search, MessageCircle, PlusSquare, Menu, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Sidebar() {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const [expanded, setExpanded] = useState(false);
  const links = [['/', Home, 'Home'], ['/search', Search, 'Search'], ['/messages', MessageCircle, 'Messages'], ['/create', PlusSquare, 'Create'], [`/profile/${user.username}`, ProfileIcon, 'Profile']];
  const signOut = async () => { await logout(); navigate('/login'); };
  return <aside className={`sidebar${expanded ? ' expanded' : ''}`}><NavLink className="ig-mark" to="/" aria-label="Instagram home"><Camera size={27}/><span className="ig-wordmark">Instagram</span></NavLink><nav className="side-nav">{links.map(([to, Icon, label]) => <NavLink key={label} to={to} end={to === '/'} title={label} data-label={label}><Icon size={23}/><span>{label}</span></NavLink>)}</nav><div className="side-bottom"><button className="sidebar-toggle" title={expanded ? 'Collapse sidebar' : 'Expand sidebar'} aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'} aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? <X size={23}/> : <Menu size={23}/>}<span>{expanded ? 'Collapse' : 'More'}</span></button><button className="side-logout" title="Log out" onClick={signOut}><LogOut size={21}/><span>Log out</span></button><div className="side-user"><Avatar user={user}/><div><b>{user.username}</b><small>{user.fullName}</small></div></div></div></aside>;
}
function ProfileIcon() { const { user } = useAuth(); return <Avatar user={user} size="md"/>; }
