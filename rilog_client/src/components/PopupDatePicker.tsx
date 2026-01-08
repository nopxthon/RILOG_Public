"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

const PopupDatePicker: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  return (
    <div className="relative flex items-center gap-2 bg-white border rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition cursor-pointer">
      <FaCalendarAlt className="text-gray-500" />
      <DatePicker
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => setDateRange(update as [Date | null, Date | null])}
        isClearable={true}
        dateFormat="dd MMM yy"
        placeholderText="Pilih rentang tanggal"
        className="outline-none text-sm w-[180px] cursor-pointer bg-transparent"
      />
    </div>
  );
};

export default PopupDatePicker;
