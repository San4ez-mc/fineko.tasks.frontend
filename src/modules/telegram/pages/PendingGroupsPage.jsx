import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import api from "../../../services/api";

export default function PendingGroupsPage() {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        api
            .get("/telegram/pending")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setGroups(data);
            })
            .catch((err) => {
                console.error("Не вдалося завантажити групи:", err);
            });
    }, []);

    const maskCode = (code = "") => {
        if (!code) return "";
        return `${code.slice(0, 2)}****`;
    };

    return (
        <Layout>
            <h2>Заявки на Telegram групи</h2>
            {groups.length === 0 ? (
                <p>Немає заявок</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Група</th>
                            <th>Код запрошення</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((g) => (
                            <tr key={g.id || g.group_id}>
                                <td>{g.title || g.name || g.group_title}</td>
                                <td>{maskCode(g.invite_code || g.inviteCode)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Layout>
    );
}
