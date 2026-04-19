import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => (
  <div className="flex min-h-screen flex-col bg-surface px-6">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

export default Layout;
