import Sidebar from './Sidebar'; export default function Layout({ children }) { return <><Sidebar/><main className="main">{children}</main><div className="mobile-bar"><Sidebar/></div></>; }
