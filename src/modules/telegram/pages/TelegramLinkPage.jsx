import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import InviteCodeForm from "../components/InviteCodeForm";
import PendingGroupList from "../components/PendingGroupList";
import { getPending } from "../api/telegram";

export default function TelegramLinkPage() {
    const [pending, setPending] = useState([]);

    const fetchPending = async () => {
        try {
            const data = await getPending();
            setPending(data || []);
        } catch (e) {
            setPending([]);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    return (
        <Layout>
            <h2>Приєднання до Телеграм</h2>
            <InviteCodeForm onLinked={fetchPending} />
            <PendingGroupList groups={pending} />
        </Layout>
    );
}
