import React from "react";
import "./UserMenu.css";
import { useAuth } from "../../../context/AuthContext";
import { useCompany } from "../../../context/CompanyContext";

export default function UserMenu() {
    const { user, logout } = useAuth();
    const { activeCompany, setActiveCompany } = useCompany();
    const companies = user?.companies || [];

    const handleChange = (e) => {
        const company = companies.find(
            (c) => String(c.id) === e.target.value
        );
        setActiveCompany(company || null);
    };

    return (
        <div className="user-dropdown">
            <ul>
                <li>Профіль</li>
                <li>Налаштування</li>
                <li className="company-select-item">
                    <span>Компанія</span>
                    <select
                        className="company-select"
                        value={activeCompany?.id || ""}
                        onChange={handleChange}
                    >
                        <option value="">Не вибрана</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </li>
                <li className="logout" onClick={logout}>
                    Вихід
                </li>
            </ul>
        </div>
    );
}
