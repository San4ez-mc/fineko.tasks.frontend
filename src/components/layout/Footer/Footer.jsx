import React from "react";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} ФІНЕКО GPT Таск-Трекер</p>
        </footer>
    );
}