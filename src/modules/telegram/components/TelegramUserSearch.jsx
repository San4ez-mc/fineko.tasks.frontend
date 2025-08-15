import React, { useState } from "react";
import { searchUsers } from "../../../services/api/telegram";
import { useCompany } from "../../../context/CompanyContext";

export default function TelegramUserSearch() {
    const { activeCompany } = useCompany();
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await searchUsers(activeCompany?.id, query);
            setUsers(data?.users || data || []);
        } catch (err) {
            setError("Не вдалося завантажити користувачів");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Пошук користувачів"
                />
                <button type="submit" disabled={loading}>
                    Пошук
                </button>
            </form>
            {error && <p>{error}</p>}
            {!error && (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ім'я</th>
                            <th>Username</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.first_name || u.name}</td>
                                <td>{u.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
