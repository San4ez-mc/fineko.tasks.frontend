import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useAuth } from "../../../context/AuthContext";
import { useCompany } from "../../../context/CompanyContext";
import TelegramGroupList from "../components/TelegramGroupList";
import { fetchGroups, refreshGroupAdmins } from "../api/telegram";
import "./TelegramGroupPage.css";

export default function TelegramGroupsPage() {
    const { user } = useAuth();
    const { activeCompany, setActiveCompany } = useCompany();

    const [companyId, setCompanyId] = useState(activeCompany?.id || "");
    const [groups, setGroups] = useState([]);

    const companies = user?.companies || [];

    useEffect(() => {
        setCompanyId(activeCompany?.id || "");
    }, [activeCompany]);

    useEffect(() => {
        if (!companyId) return;
        loadGroups(companyId);
    }, [companyId]);

    const loadGroups = async (cid) => {
        try {
            const data = await fetchGroups(cid);
            setGroups(data || []);
        } catch (e) {
            console.error("Помилка завантаження груп", e);
        }
    };

    const onCompanyChange = (id) => {
        setCompanyId(id);
        const company = companies.find((c) => String(c.id) === id);
        setActiveCompany(company || null);
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
                <div className="link-form">
                    <select value={companyId} onChange={(e) => onCompanyChange(e.target.value)} required>
                        <option value="">Оберіть компанію</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                {companyId && (
                    <section>
                        <TelegramGroupList groups={groups} onRefreshAdmins={handleRefresh} />
                    </section>
                )}
            </div>
        </Layout>
    );
}
