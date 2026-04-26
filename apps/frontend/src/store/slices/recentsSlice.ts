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
  },
});

export const { addRecent, clearRecents } = recentsSlice.actions;
export default recentsSlice.reducer;
