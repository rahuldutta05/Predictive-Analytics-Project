import React from "react";
import "./BottomNav.css";

export default function BottomNav({ active, items, onNavigate }) {
  return (
    <nav className="c-bottom-nav" aria-label="Bottom navigation">
      {items.map((item) => (
        <button
          key={item.id}
          className={`c-nav-item${active === item.id ? " active" : ""}${item.farmerTab ? " farmer-tab" : ""}`}
          onClick={() => onNavigate(item.id)}
          type="button"
        >
          <span className="c-nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="c-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

