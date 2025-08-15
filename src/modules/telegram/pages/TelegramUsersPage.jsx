import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { getUsers } from "../api/telegram";

export default function TelegramUsersPage() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data || []);
            } catch (e) {
                setUsers([]);
            }
        };
        fetchUsers();
    }, []);

    return (
        <Layout>
            <h2>Телеграм користувачі</h2>
            {users.length === 0 ? (
                <p>Користувачів немає</p>
            ) : (
                <ul>
                    {users.map((u) => (
                        <li key={u.id || u.username}>
                            {u.name || u.username || u.id}
                        </li>
                    ))}
                </ul>
            )}
        </Layout>
    );
}
