// frontend/src/modules/auth/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../../../components/layout/AuthLayout/AuthLayout";
import "./LoginPage.css";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login({ username, password }); // ✅ передаємо як об’єкт
            if (user) {
                const redirect = searchParams.get("redirect");
                navigate(redirect || "/tasks");
            } else {
                setError("Невірний логін або пароль");
            }
        } catch (err) {
            console.error(err);
            setError("Помилка авторизації");
        }
    };

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Авторизація</h2>
                {error && <div className="error">{error}</div>}
                <div className="form-group">
                    <label>Логін</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Введіть логін"
                    />
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введіть пароль"
                    />
                </div>
                <button type="submit">Увійти</button>
                <button
                    type="button"
                    className="telegram-btn"
                    onClick={() => navigate("/auth/telegram")}
                >
                    Увійти через Telegram
                </button>
                <div className="forgot-link">
                    <Link to="/auth/forgot">Забули пароль?</Link>
                </div>
            </form>
        </AuthLayout>
    );
}
