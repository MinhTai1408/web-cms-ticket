import { configureStore } from "@reduxjs/toolkit";

import ticketReducer from "../features/ticketSlice";
const rootReducer = {
  tickets: ticketReducer,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
