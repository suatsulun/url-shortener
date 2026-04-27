import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type RecentLink = {
  shortId: string;
  originalUrl: string;
  createdAt: string;
};

type RecentsState = {
  items: RecentLink[];
};

const initialState: RecentsState = {
  items: [],
};

const recentsSlice = createSlice({
  name: "recents",
  initialState,
  reducers: {
    addRecent: (state, action: PayloadAction<RecentLink>) => {
      state.items.unshift(action.payload);
      state.items = state.items.slice(0, 5);
    },
    clearRecents: (state) => {
      state.items = [];
    },
    removeRecent: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.shortId !== action.payload,
      );
    },
    restoreRecents: (state, action: PayloadAction<RecentLink[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addRecent, clearRecents, removeRecent, restoreRecents } =
  recentsSlice.actions;
export default recentsSlice.reducer;
