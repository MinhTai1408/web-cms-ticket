import { createSlice } from "@reduxjs/toolkit";

import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Ticket } from "../interface/dataTicket";
import { db } from "../../firebase/Firebase";

export interface TicketWithId {
  id: string;
  ticket: Ticket;
}

interface TicketState {
  ticketArray: TicketWithId[];
}

// fetch books
export const fetchTicket = createAsyncThunk<TicketWithId[]>(
  "tickets/fetchTicket",
  async () => {
    const querySnapshot = await getDocs(collection(db, "Ticket"));
    const tickets = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ticket: doc.data() as Ticket,
    }));
    return tickets;
  }
);

export const updateTicket = createAsyncThunk<TicketWithId, TicketWithId>(
  "tickets/updateTicket",
  async (editedTicket) => {
    if (!editedTicket.ticket) {
      throw new Error("Invalid book data");
    }
    const accountRef = doc(db, "Ticket", editedTicket.id);
    await updateDoc(accountRef, editedTicket.ticket as Partial<Ticket>);
    return editedTicket;
  }
);

const ticketSlice = createSlice({
  name: "Tickets",
  initialState: {
    ticketArray: [] as TicketWithId[],
  } as TicketState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicket.fulfilled, (state, action) => {
        state.ticketArray = action.payload;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        const { id, ticket } = action.payload;
        const ticketsIndex = state.ticketArray.findIndex(
          (ticket) => ticket.id === id
        );
        if (ticketsIndex !== -1) {
          state.ticketArray[ticketsIndex] = { id: id, ticket };
        }
      });
  },
});

export default ticketSlice.reducer;
