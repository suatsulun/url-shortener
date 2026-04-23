import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import GuestHeader from "./GuestHeader";

const GuestLayout = () => (
  <div className="flex min-h-screen flex-col bg-surface px-6">
    <GuestHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default GuestLayout;
