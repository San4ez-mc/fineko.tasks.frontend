// frontend/src/modules/auth/pages/ResetPasswordPage.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config/env";
import AuthLayout from "../../../components/layout/AuthLayout/AuthLayout";
import "./LoginPage.css";

export default function ResetPasswordPage() {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            const res = await axios.post(
                `${API_BASE_URL}/auth/reset-password`,
                { token, password }
            );
            if (res.data && res.data.success) {
                setMessage("Пароль успішно змінено. Можете увійти.");
            } else {
                setError(res.data.message || "Сталася помилка");
            }
        } catch (err) {
            setError("Сталася помилка");
        }
    };

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Скидання паролю</h2>
                {message && <div className="success">{message}</div>}
                {error && <div className="error">{error}</div>}
                <div className="form-group">
                    <label>Новий пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введіть новий пароль"
                    />
                </div>
                <button type="submit">Змінити пароль</button>
                <div className="forgot-link">
                    <Link to="/auth">Повернутися до входу</Link>
                </div>
            </form>
        </AuthLayout>
    );
}
