import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Shorten from "./pages/Shorten";
import Auth from "./pages/Auth";
import LinkCreated from "./pages/LinkCreated";
import NotFound from "./pages/NotFound";
import Profile from "./pages/profile/Index";
import Security from "./pages/profile/Security";
import Edit from "./pages/profile/Edit";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";
import GuestLayout from "./components/GuestLayout";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFound />} />

        <Route element={<GuestRoute />}>
          <Route element={<GuestLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/shorten" element={<Shorten />} />
            <Route path="/link-created" element={<LinkCreated />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/security" element={<Security />} />
            <Route path="/profile/edit" element={<Edit />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
