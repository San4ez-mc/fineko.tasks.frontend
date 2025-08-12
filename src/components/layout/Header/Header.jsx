import React, { useState } from "react";
import "./Header.css";
import { FiMenu, FiSearch, FiCheckSquare } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import UserMenu from "../UserMenu/UserMenu";

export default function Header() {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user } = useAuth();

    const handleLeftToggle = () => {
        window.dispatchEvent(new CustomEvent("ui:toggleLeftSidebar"));
    };

    const handleRightToggle = () => {
        window.dispatchEvent(new CustomEvent("ui:toggleRightSidebar"));
    };

    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "";

    return (
        <header className="app-header">
            <div className="header-left">
                <button
                    className="icon-btn"
                    aria-label="Відкрити меню"
                    onClick={handleLeftToggle}
                    type="button"
                >
                    <FiMenu size={20} />
                </button>
            </div>

            <div className="header-center">
                <div className="header-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="Пошук..."
                    />
                </div>
            </div>

            <div className="header-right">
                <button className="btn ghost" type="button">Open Telegram</button>
                <button
                    className="icon-btn"
                    aria-label="Задачі на сьогодні"
                    onClick={handleRightToggle}
                    type="button"
                >
                    <FiCheckSquare size={20} />
                </button>
                <div
                    className="user-avatar"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                    {initials}
                </div>
                {userMenuOpen && <UserMenu />}
            </div>
        </header>
    );
}
