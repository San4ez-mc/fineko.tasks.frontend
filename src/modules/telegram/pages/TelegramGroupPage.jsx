import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import GroupList from "../components/GroupList";
import { getGroups } from "../api/telegram";

export default function TelegramGroupPage() {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getGroups();
                setGroups(data || []);
            } catch (e) {
                setGroups([]);
            }
        };
        fetch();
    }, []);

    return (
        <Layout>
            <h2>Телеграм</h2>
            <nav>
                <ul>
                    <li>
                        <Link to="/telegram/link">Приєднатись за кодом</Link>
                    </li>
                    <li>
                        <Link to="/telegram/groups">Групи</Link>
                    </li>
                    <li>
                        <Link to="/telegram/users">Користувачі</Link>
                    </li>
                </ul>
            </nav>
            <GroupList groups={groups} />
        </Layout>
    );
}
