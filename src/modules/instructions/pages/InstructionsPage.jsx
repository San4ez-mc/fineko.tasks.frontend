import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import { getInstructions } from "../api/instructions.js";
import InstructionItem from "../components/InstructionItem.jsx";
import "./InstructionsPage.css";

export default function InstructionsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);

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
                            <InstructionItem
                                key={inst.id}
                                instruction={inst}
                                onClick={() => setSelected(inst)}
                            />
                        ))}
                    </div>
                )}

                {selected && (
                    <div className="instruction-modal" onClick={() => setSelected(null)}>
                        <div
                            className="instruction-modal__dialog card"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="instruction-modal__head">
                                <h2>{selected.title}</h2>
                                <button
                                    className="btn xs ghost"
                                    onClick={() => setSelected(null)}
                                >
                                    ✖
                                </button>
                            </div>
                            {selected.body && (
                                <div className="instruction-item__body">{selected.body}</div>
                            )}
                            <div className="instruction-item__access">
                                <div className="instruction-item__editors">
                                    <strong>Можуть редагувати:</strong>{" "}
                                    {(selected.editors || [])
                                        .map((u) => u.name || u)
                                        .join(", ") || "—"}
                                </div>
                                <div className="instruction-item__viewers">
                                    <strong>Можуть переглядати:</strong>{" "}
                                    {(selected.viewers || [])
                                        .map((u) => u.name || u)
                                        .join(", ") || "—"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
