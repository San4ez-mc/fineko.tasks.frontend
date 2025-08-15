import React, { useState } from "react";
import { linkByCode } from "../api/telegram";

export default function InviteCodeForm({ onLinked }) {
    const [code, setCode] = useState("");
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await linkByCode(code);
            setStatus("Успішно");
            setCode("");
            if (onLinked) onLinked();
        } catch (e) {
            setStatus("Помилка");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={code}
                placeholder="Код запрошення"
                onChange={(e) => setCode(e.target.value)}
            />
            <button type="submit">Приєднатись</button>
            {status && <div>{status}</div>}
        </form>
    );
}
