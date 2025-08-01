// frontend/src/modules/auth/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../../components/layout/AuthLayout/AuthLayout";
import "./LoginPage.css";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ok = await login(username, password);
        if (ok) {
            navigate("/");
        } else {
            setError("Невірний логін або пароль");
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
                    onClick={() =>
                        window.open(
                            "https://t.me/finekobot?start=login",
                            "_blank"
                        )
                    }
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
