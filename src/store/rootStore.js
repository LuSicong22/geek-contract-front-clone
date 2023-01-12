import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

export const rootStore = configureStore({
  reducer: {
    rooter: rootReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["setTronObj"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.tronWeb"],
        // Ignore these paths in the state
        ignoredPaths: ["rooter.tronObj.tronWeb"],
      },
    }),
});
