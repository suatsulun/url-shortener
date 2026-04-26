import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import recentsReducer from "./slices/recentsSlice";
import preferencesReducer from "./slices/preferencesSlice";
import urlsApi from "./api/urlsApi";

const rootReducer = combineReducers({
  recents: recentsReducer,
  preferences: preferencesReducer,
  [urlsApi.reducerPath]: urlsApi.reducer,
});

const persistConfig = {
  key: "url-shortener",
  storage,
  whitelist: ["recents", "preferences"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(urlsApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
