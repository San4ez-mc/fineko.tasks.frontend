import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import { useCompany } from "../../../context/CompanyContext";
import { fetchGroup } from "../api/telegram";

export default function TelegramGroupDetails() {
    const { id } = useParams();
    const { activeCompany } = useCompany();
    const [group, setGroup] = useState(null);
    const [activities, setActivities] = useState([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (!id || !activeCompany?.id) return;
        loadGroup(id, activeCompany.id);
    }, [id, activeCompany]);

    const loadGroup = async (gid, companyId) => {
        try {
            const data = await fetchGroup(gid, companyId);
            setGroup(data || null);
            setActivities(data?.activities || []);
        } catch (e) {
            console.error("Помилка завантаження групи", e);
        }
    };

    const displayed = showAll ? activities : activities.slice(0, 10);

    return (
        <Layout>
            <div className="telegram-page">
                <h2>{group?.title || "Група"}</h2>
                <section>
                    <h3>Активності</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Тип</th>
                                <th>Відповідальний</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayed.map((a, idx) => (
                                <tr key={idx}>
                                    <td>{a.date}</td>
                                    <td>{a.type}</td>
                                    <td>{a.responsible}</td>
                                </tr>
                            ))}
                            {displayed.length === 0 && (
                                <tr>
                                    <td colSpan="3">Немає активностей</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {activities.length > 10 && (
                        <button className="btn" onClick={() => setShowAll(!showAll)}>
                            {showAll ? "Показати менше" : "Показати більше"}
                        </button>
                    )}
                </section>
            </div>
        </Layout>
    );
}
