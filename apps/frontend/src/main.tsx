import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ToastProvider, ToastViewport } from "./components/ui/Toast.tsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store/index.ts";
import PageSpinner from "./components/ui/PageSpinner.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<PageSpinner />}>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
          <ToastViewport />
        </ToastProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
