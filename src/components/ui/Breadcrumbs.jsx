import React from "react";
import { Link } from "react-router-dom";
import "./Breadcrumbs.css";

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="breadcrumbs" aria-label="breadcrumbs">
      {items.map((item, i) => (
        <span key={i} className="crumb">
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
          {i < items.length - 1 && <span className="sep">/</span>}
        </span>
      ))}
    </nav>
  );
}
