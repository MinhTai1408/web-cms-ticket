import React from "react";
import { Route, Routes } from "react-router-dom";

import TicketPackage from "../components/setting/TicketPackage";

import TicketExchange from "../components/ticketExchange/TicketExchange";
import TicketList from "../components/ticketList/TicketList";

import DashBoard from "../components/home/DashBoard";

const Defaulayout = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<DashBoard />} />
        <Route path="/settings/ticket_package" element={<TicketPackage />} />
        <Route path="/ticket_exchange" element={<TicketExchange />} />
        <Route path="/ticket_list" element={<TicketList />} />
      </Routes>
    </div>
  );
};

export default Defaulayout;
