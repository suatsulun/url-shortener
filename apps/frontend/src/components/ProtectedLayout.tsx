import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import ProtectedHeader from "./ProtectedHeader";
import AuthBridge from "./AuthBridge";

const ProtectedLayout = () => (
  <div className="flex min-h-screen flex-col bg-surface px-6">
    <ProtectedHeader />
    <AuthBridge />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default ProtectedLayout;
