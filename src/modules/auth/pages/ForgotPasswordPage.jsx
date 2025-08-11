// frontend/src/modules/auth/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config/env";
import AuthLayout from "../../../components/layout/AuthLayout/AuthLayout";
import "./LoginPage.css";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            const res = await axios.post(
                `${API_BASE_URL}/auth/request-password-reset`,
                { email }
            );
            if (res.data && res.data.success) {
                setMessage("Лист із посиланням для відновлення паролю надіслано.");
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
                <h2>Відновлення паролю</h2>
                {message && <div className="success">{message}</div>}
                {error && <div className="error">{error}</div>}
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Введіть email"
                    />
                </div>
                <button type="submit">Надіслати</button>
                <div className="forgot-link">
                    <Link to="/auth">Повернутися до входу</Link>
                </div>
            </form>
        </AuthLayout>
    );
}
