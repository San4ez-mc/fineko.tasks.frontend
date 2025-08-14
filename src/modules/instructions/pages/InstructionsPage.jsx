import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import { getInstructions } from "../api/instructions.js";
import InstructionItem from "../components/InstructionItem.jsx";
import "./InstructionsPage.css";

export default function InstructionsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getInstructions();
                setItems(data.items || data || []);
            } catch (err) {
                console.error("Не вдалося завантажити інструкції", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <Layout>
            <div className="instructions-page">
                <h1>Інструкції</h1>
                {loading && <div className="instructions-loader">Завантаження…</div>}
                {!loading && items.length === 0 && (
                    <div className="instructions-empty">Немає інструкцій</div>
                )}
                {!loading && items.length > 0 && (
                    <div className="instructions-list">
                        {items.map((inst) => (
                            <InstructionItem key={inst.id} instruction={inst} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
