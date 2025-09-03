import React, { useEffect, useRef, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useAuth } from "../../../context/AuthContext";
import { useCompany } from "../../../context/CompanyContext";
import TelegramGroupList from "../components/TelegramGroupList";
import TelegramGroupDetails from "../components/TelegramGroupDetails";
import {
    fetchGroups,
    refreshGroupAdmins,
    linkGroupByCode,
    deleteGroup,
} from "../api/telegram";
import "./TelegramGroupPage.css";

export default function TelegramGroupsPage() {
    const { user } = useAuth();
    const { activeCompany, setActiveCompany } = useCompany();

    const [companyId, setCompanyId] = useState(activeCompany?.id || "");
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [inviteCode, setInviteCode] = useState("");
    const formRef = useRef(null);

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

    const handleSelect = (g) => {
        setSelectedGroup(g);
    };

    const handleRemove = async (id) => {
        if (!window.confirm("Відключити групу?")) return;
        try {
            await deleteGroup(id);
            loadGroups(companyId);
            if (selectedGroup && selectedGroup.id === id) {
                setSelectedGroup(null);
            }
        } catch (e) {
            console.error("Помилка відключення групи", e);
        }
    };

    const handleLink = async (e) => {
        e.preventDefault();
        try {
            await linkGroupByCode({ inviteCode, companyId });
            setInviteCode("");
            loadGroups(companyId);
        } catch (err) {
            console.error("Помилка прив'язки", err);
        }
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <Layout>
            <div className="telegram-page">
                <div className="telegram-page__header">
                    <h2>Telegram групи</h2>
                    <button className="btn primary" onClick={scrollToForm}>
                        Підключити групу
                    </button>
                </div>
                <div className="telegram-page__body">
                    <div className="telegram-page__main">
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
                                <TelegramGroupList
                                    groups={groups}
                                    onSelect={handleSelect}
                                    onRemove={handleRemove}
                                    onRefreshAdmins={handleRefresh}
                                />
                            </section>
                        )}
                        {selectedGroup && (
                            <TelegramGroupDetails
                                groupId={selectedGroup.id}
                                onClose={() => setSelectedGroup(null)}
                            />
                        )}
                    </div>
                    <aside className="telegram-page__aside">
                        <h3>Інструкція підключення</h3>
                        <ol>
                            <li>Додайте бота в групу</li>
                            <li>Запустіть команду /start</li>
                            <li>Отримайте код прив'язки</li>
                            <li>Введіть код у форму</li>
                        </ol>
                        <a href="https://t.me/finekobot" target="_blank" rel="noreferrer">
                            Відкрити бота
                        </a>
                        <form ref={formRef} className="link-form" onSubmit={handleLink}>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Код підтвердження"
                                required
                            />
                            <button className="btn primary" type="submit">
                                Підключити
                            </button>
                        </form>
                    </aside>
                </div>
                <button className="btn primary fab" onClick={scrollToForm}>
                    +
                </button>
            </div>
        </Layout>
    );
}
