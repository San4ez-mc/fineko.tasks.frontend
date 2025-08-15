import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import GroupList from "../components/GroupList";
import { getGroups } from "../api/telegram";

export default function TelegramGroupsPage() {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await getGroups();
                setGroups(data || []);
            } catch (e) {
                setGroups([]);
            }
        };
        fetchGroups();
    }, []);

    return (
        <Layout>
            <h2>Телеграм групи</h2>
            <GroupList groups={groups} />
        </Layout>
    );
}
