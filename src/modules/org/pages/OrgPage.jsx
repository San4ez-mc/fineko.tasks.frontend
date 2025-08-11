import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../../components/layout/Layout";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import "./OrgPage.css";

export default function OrgPage() {
    const [positions, setPositions] = useState([]);
    const [tree, setTree] = useState([]);
    const [search, setSearch] = useState("");
    const [highlightedIds, setHighlightedIds] = useState([]);

    const nodeRefs = useRef({});
    const canvasRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/org/positions`).then((res) => setPositions(res.data || [])).catch(() => {});
        axios.get(`${API_BASE_URL}/org/tree`).then((res) => setTree(res.data || [])).catch(() => {});
    }, []);

    const filteredPositions = useMemo(() => {
        if (!search) return positions;
        const q = search.toLowerCase();
        return positions.filter((p) => {
            const dept = p.department?.name || "";
            const managers = (p.managers || []).map((m) => m.name).join(" ");
            return (
                p.name.toLowerCase().includes(q) ||
                dept.toLowerCase().includes(q) ||
                managers.toLowerCase().includes(q)
            );
        });
    }, [positions, search]);

    useEffect(() => {
        const q = search.toLowerCase();
        if (!q) {
            setHighlightedIds([]);
            return;
        }
        const ids = [];
        const walk = (units) => {
            units.forEach((u) => {
                if (u.name?.toLowerCase().includes(q)) ids.push(`unit-${u.id}`);
                (u.departments || []).forEach(walk);
                (u.employees || []).forEach((e) => {
                    if (
                        e.name?.toLowerCase().includes(q) ||
                        e.position?.toLowerCase().includes(q)
                    ) {
                        ids.push(`emp-${e.id}`);
                    }
                });
            });
        };
        walk(tree);
        setHighlightedIds(ids);
    }, [search, tree]);

    const scrollToNode = (id) => {
        const el = nodeRefs.current[id];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        setHighlightedIds([id]);
    };

    const renderEmployees = (arr) => (
        <div className="org-children">
            {arr.map((e) => (
                <div
                    key={`emp-${e.id}`}
                    ref={(el) => (nodeRefs.current[`emp-${e.id}`] = el)}
                    className={`org-node org-employee ${
                        highlightedIds.includes(`emp-${e.id}`) ? "is-highlighted" : ""
                    }`}
                >
                    <div className="title">{e.name}</div>
                    <div className="muted">{e.position}</div>
                    {e.isManager && <span className="badge important">Керівник</span>}
                </div>
            ))}
        </div>
    );

    const renderDepartments = (arr) => (
        <div className="org-level">
            {arr.map((dep) => (
                <div
                    key={`unit-${dep.id}`}
                    ref={(el) => (nodeRefs.current[`unit-${dep.id}`] = el)}
                    className={`org-node ${
                        highlightedIds.includes(`unit-${dep.id}`) ? "is-highlighted" : ""
                    }`}
                >
                    <div className="title">{dep.name}</div>
                    {dep.head && <div className="badge neutral">{dep.head.name}</div>}
                    {dep.productValue && (
                        <textarea
                            className="input product-value"
                            defaultValue={dep.productValue}
                            rows={2}
                        />
                    )}
                    {dep.employees && dep.employees.length > 0 &&
                        renderEmployees(dep.employees)}
                </div>
            ))}
        </div>
    );

    const renderTree = () => (
        <div className="org-level">
            {tree.map((div) => (
                <div
                    key={`unit-${div.id}`}
                    ref={(el) => (nodeRefs.current[`unit-${div.id}`] = el)}
                    className={`org-node ${
                        highlightedIds.includes(`unit-${div.id}`) ? "is-highlighted" : ""
                    }`}
                >
                    <div className="title">{div.name}</div>
                    {div.head && <div className="badge neutral">{div.head.name}</div>}
                    {div.productValue && (
                        <textarea
                            className="input product-value"
                            defaultValue={div.productValue}
                            rows={2}
                        />
                    )}
                    {div.departments && div.departments.length > 0 &&
                        renderDepartments(div.departments)}
                </div>
            ))}
        </div>
    );

    const onWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            setScale((s) => Math.min(2, Math.max(0.5, s - e.deltaY * 0.01)));
        }
    };
    const zoomIn = () => setScale((s) => Math.min(2, s + 0.1));
    const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.1));
    const resetView = () => {
        setScale(1);
        if (canvasRef.current) {
            canvasRef.current.scrollLeft = 0;
            canvasRef.current.scrollTop = 0;
        }
    };

    return (
        <Layout>
            <h1>Орг. структура</h1>
            <div className="org-layout">
                <aside className="org-left card">
                    <div className="org-filters">
                        <label className="rf-search">
                            <input
                                className="input"
                                type="search"
                                placeholder="Пошук ПІБ/посади/відділу…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </label>
                        <select className="input">
                            <option>Відділення</option>
                        </select>
                        <select className="input">
                            <option>Відділ</option>
                        </select>
                        <select className="input">
                            <option>Роль</option>
                        </select>
                        <button className="btn ghost" onClick={() => setSearch("")}>Скинути фільтри</button>
                    </div>
                    <button className="btn primary add-pos">Додати посаду</button>
                    <table className="table org-table">
                        <thead>
                            <tr>
                                <th>Посада</th>
                                <th>Керівник(и)</th>
                                <th>Відділ</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPositions.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <button
                                            className="btn ghost"
                                            onClick={() => scrollToNode(`emp-${p.id}`)}
                                        >
                                            {p.name}
                                        </button>
                                    </td>
                                    <td>{(p.managers || []).map((m) => m.name).join(", ")}</td>
                                    <td>{p.department?.name}</td>
                                    <td>
                                        <button className="btn ghost">Перейти</button>
                                        <button className="btn ghost">Видалити</button>
                                        <button className="btn ghost">Перемістити</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </aside>
                <main
                    className="org-canvas"
                    onWheel={onWheel}
                    ref={canvasRef}
                >
                    <div className="zoom-controls">
                        <button className="btn ghost" onClick={zoomIn}>+</button>
                        <button className="btn ghost" onClick={zoomOut}>−</button>
                        <button className="btn ghost" onClick={resetView}>Reset view</button>
                    </div>
                    <div
                        className="org-canvas-inner"
                        style={{ transform: `scale(${scale})`, transformOrigin: "0 0" }}
                    >
                        {renderTree()}
                    </div>
                </main>
            </div>
        </Layout>
    );
}

