import React from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { FiMenu, FiBarChart2, FiCheckSquare, FiGrid, FiSend } from "react-icons/fi";

export default function Sidebar({ isOpen, onToggle, position = "left" }) {
    return (
        <aside className={`sidebar ${position} ${isOpen ? "expanded" : ""}`}>
            <div className="sidebar-content">

                {/* Верхня панель з кнопкою */}
                <div className="sidebar-top">
                    <button className="sidebar-toggle" onClick={onToggle}>
                        <FiMenu size={22} />
                    </button>

                    {/* Логотип тільки коли меню відкрите */}
                    {isOpen && (
                        <div className="sidebar-logo">
                            <img src="https://app.fineko.space//img/logo_.png" alt="Logo" />
                        </div>
                    )}
                </div>

                {/* Пункти меню */}
                <nav>
                    <ul>
                        <li>
                            <NavLink to="/results" activeclassname="active">
                                <FiBarChart2 className="menu-icon" />
                                {isOpen && <span className="menu-text">Результати</span>}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/tasks" activeclassname="active">
                                <FiCheckSquare className="menu-icon" />
                                {isOpen && <span className="menu-text">Щоденні задачі</span>}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/org-structure" activeclassname="active">
                                <FiGrid className="menu-icon" />
                                {isOpen && <span className="menu-text">Орг. структура</span>}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/telegram-group" activeclassname="active">
                                <FiSend className="menu-icon" />
                                {isOpen && <span className="menu-text">Телеграм</span>}
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
