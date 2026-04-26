import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type SortField = "shortId" | "clicks" | "createdAt" | "expiresAt";
type SortDirection = "asc" | "desc";

type PreferencesState = {
  dashboardSort: { field: SortField; direction: SortDirection };
};

const initialState: PreferencesState = {
  dashboardSort: { field: "createdAt", direction: "desc" },
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setDashboardSort: (
      state,
      action: PayloadAction<PreferencesState["dashboardSort"]>,
    ) => {
      state.dashboardSort = action.payload;
    },
  },
});

export const { setDashboardSort } = preferencesSlice.actions;
export default preferencesSlice.reducer;
