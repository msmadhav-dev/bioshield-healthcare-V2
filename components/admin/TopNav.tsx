"use client";

import { Bell, Search } from "lucide-react";

export default function TopNav() {
  return (
    <header
      className="h-[62px] flex items-center justify-between px-6 flex-shrink-0"
      style={{ backgroundColor: "#fff", borderBottom: "1px solid #E5E7EB" }}
    >
      {/* Search bar */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-lg"
        style={{ backgroundColor: "#F3F4F6", width: "300px" }}
      >
        <Search size={14} className="text-gray-400" strokeWidth={2} />
        <input
          type="text"
          placeholder="Enter Keywords..."
          className="bg-transparent text-[13px] outline-none flex-1 text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          className="relative w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          <Bell size={16} strokeWidth={2} className="text-gray-600" />
          <span
            className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full border-2 border-white"
            style={{ backgroundColor: "#EF4444" }}
          />
        </button>

        {/* Profile */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold cursor-pointer"
          style={{ backgroundColor: "#4C1D95" }}
        >
          A
        </div>
      </div>
    </header>
  );
}