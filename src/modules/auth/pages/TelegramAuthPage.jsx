import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function TelegramAuthPage() {
    const { telegramLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        let token = params.get("token") || params.get("jwt");
        if (!token && location.hash) {
            const hashParams = new URLSearchParams(location.hash.slice(1));
            token = hashParams.get("token") || hashParams.get("jwt");
        }
        if (token) {
            telegramLogin(token)
                .then(() => navigate("/tasks"))
                .catch(() => navigate("/auth"));
        } else {
            window.open("https://t.me/finekobot?start=login", "_blank");
        }
    }, [location, telegramLogin, navigate]);

    return <div>Зачекайте, авторизація через Telegram...</div>;
}
