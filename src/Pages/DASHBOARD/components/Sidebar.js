// DASHBOARD/components/Sidebar.js
import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menu = [
    "home",
    "users",
    "messages",
    "products",
    "addProduct",
    "discounts",
    "orders",
    "reports",
    "helps",
    "advertisements",
    "banners",
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>

      <ul className="sidebar-menu">
        {menu.map((item) => (
          <li
            key={item}
            className={activeTab === item ? "active" : ""}
            onClick={() => setActiveTab(item)}
          >
            {item === "advertisements" ? "📢 Advertisements" : item}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;