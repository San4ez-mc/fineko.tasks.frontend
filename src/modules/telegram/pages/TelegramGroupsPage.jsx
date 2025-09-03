import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useAuth } from "../../../context/AuthContext";
import { useCompany } from "../../../context/CompanyContext";
import TelegramGroupList from "../components/TelegramGroupList";
import TelegramInviteForm from "../components/TelegramInviteForm";
import TelegramPendingList from "../components/TelegramPendingList";
import {
    linkGroupByCode,
    fetchPendingGroups,
    fetchGroups,
    refreshGroupAdmins,
} from "../api/telegram";
import "./TelegramGroupPage.css";

export default function TelegramGroupsPage() {
    const { user } = useAuth();
    const { activeCompany, setActiveCompany } = useCompany();

    const [inviteCode, setInviteCode] = useState("");
    const [companyId, setCompanyId] = useState(activeCompany?.id || "");
    const [groups, setGroups] = useState([]);
    const [pending, setPending] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const companies = user?.companies || [];

    useEffect(() => {
        setCompanyId(activeCompany?.id || "");
    }, [activeCompany]);

    useEffect(() => {
        if (!companyId) return;
        loadGroups(companyId);
        loadPending(companyId);
    }, [companyId]);

    const loadGroups = async (cid) => {
        try {
            const data = await fetchGroups(cid);
            setGroups(data || []);
        } catch (e) {
            console.error("Помилка завантаження груп", e);
        }
    };

    const loadPending = async (cid) => {
        try {
            const data = await fetchPendingGroups(cid);
            setPending(data || []);
        } catch (e) {
            console.error("Помилка завантаження pending groups", e);
        }
    };

    const onCompanyChange = (id) => {
        setCompanyId(id);
        const company = companies.find((c) => String(c.id) === id);
        setActiveCompany(company || null);
    };

    const handleLink = async (e) => {
        e.preventDefault();
        try {
            const data = await linkGroupByCode({ inviteCode, companyId });
            window.dispatchEvent(
                new CustomEvent("toast", {
                    detail: { type: "success", message: `Групу прив'язано: ${data.title}` },
                })
            );
            setInviteCode("");
            loadGroups(companyId);
            loadPending(companyId);
        } catch (err) {
            console.error("Помилка прив'язки групи", err);
        }
    };

    const handleCancel = () => {
        setInviteCode("");
        setShowForm(false);
        window.dispatchEvent(
            new CustomEvent("toast", {
                detail: { type: "info", message: "Прив'язку скасовано" },
            })
        );
    };

    const handleRefresh = async (id) => {
        try {
            await refreshGroupAdmins(id);
            window.dispatchEvent(
                new CustomEvent("toast", { detail: { type: "success", message: "Адмінів оновлено" } })
            );
        } catch (e) {
            console.error("Помилка оновлення адмінів", e);
        }
    };

    return (
        <Layout>
            <div className="telegram-page">
                <h2>Telegram групи</h2>
                {showForm ? (
                    <TelegramInviteForm
                        inviteCode={inviteCode}
                        companyId={companyId}
                        companies={companies}
                        onInviteCodeChange={(v) => setInviteCode(v.toUpperCase())}
                        onCompanyChange={onCompanyChange}
                        onSubmit={handleLink}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="link-form">
                        <button className="btn primary" onClick={() => setShowForm(true)}>
                            Підключити
                        </button>
                    </div>
                )}
                {companyId && (
                    <section>
                        <h3>Очікуючі групи</h3>
                        <TelegramPendingList groups={pending} />
                    </section>
                )}
                {companyId && (
                    <section>
                        <TelegramGroupList groups={groups} onRefreshAdmins={handleRefresh} />
                    </section>
                )}
            </div>
        </Layout>
    );
}
