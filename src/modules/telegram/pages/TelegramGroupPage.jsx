import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { getPendingGroups } from "../api/telegram";

export default function TelegramGroupPage() {
    const [pending, setPending] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPendingGroups();
                setPending(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Failed to load telegram groups", e);
            }
        };
        load();
    }, []);

    return (
        <Layout>
            <h2>Телеграм група організації</h2>
            {pending.length > 0 ? (
                <ul>
                    {pending.map((g) => (
                        <li key={g.id || g.group_id}>{g.title || g.name}</li>
                    ))}
                </ul>
            ) : (
                <p>
                    Приєднуйтесь до нашого чату: <a href="https://t.me/finekogroup" target="_blank" rel="noreferrer">t.me/finekogroup</a>
                </p>
            )}
        </Layout>
    );
}
