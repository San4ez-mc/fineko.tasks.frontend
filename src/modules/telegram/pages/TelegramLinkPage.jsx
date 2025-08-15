import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useAuth } from "../../../context/AuthContext";
import { useCompany } from "../../../context/CompanyContext";
import TelegramInviteForm from "../components/TelegramInviteForm";
import TelegramPendingList from "../components/TelegramPendingList";
import {
    linkGroupByCode,
    fetchPendingGroups,
} from "../api/telegram";
import "./TelegramGroupPage.css";

export default function TelegramLinkPage() {
    const { user } = useAuth();
    const { activeCompany, setActiveCompany } = useCompany();

    const [inviteCode, setInviteCode] = useState("");
    const [companyId, setCompanyId] = useState(activeCompany?.id || "");
    const [pending, setPending] = useState([]);

    const companies = user?.companies || [];

    useEffect(() => {
        setCompanyId(activeCompany?.id || "");
    }, [activeCompany]);

    useEffect(() => {
        if (!companyId) return;
        loadPending(companyId);
    }, [companyId]);

    const loadPending = async (cid) => {
        try {
            const data = await fetchPendingGroups(cid);
            setPending(data || []);
        } catch (e) {
            console.error("Помилка завантаження pending groups", e);
        }
    };

    const handleLink = async (e) => {
        e.preventDefault();
        try {
            const data = await linkGroupByCode({ inviteCode, companyId });
            window.dispatchEvent(
                new CustomEvent("toast", {
                    detail: {
                        type: "success",
                        message: `Групу прив'язано: ${data.title}`,
                    },
                })
            );
            setInviteCode("");
            loadPending(companyId);
        } catch (err) {
            console.error("Помилка прив'язки групи", err);
        }
    };

    const onCompanyChange = (id) => {
        setCompanyId(id);
        const company = companies.find((c) => String(c.id) === id);
        setActiveCompany(company || null);
    };

    return (
        <Layout>
            <div className="telegram-page">
                <h2>Прив'язка Telegram групи</h2>
                <TelegramInviteForm
                    inviteCode={inviteCode}
                    companyId={companyId}
                    companies={companies}
                    onInviteCodeChange={(v) => setInviteCode(v.toUpperCase())}
                    onCompanyChange={onCompanyChange}
                    onSubmit={handleLink}
                />
                {companyId && (
                    <section>
                        <h3>Очікуючі групи</h3>
                        <TelegramPendingList groups={pending} />
                    </section>
                )}
            </div>
        </Layout>
    );
}
