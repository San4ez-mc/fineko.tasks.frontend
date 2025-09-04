import React from "react";
import "./ResultsSidebar.css";

export default function ResultsSidebar({ results = [], onSelectResult }) {
    return (
        <aside className="results-sidebar">
            <h2 className="rs-title">Результати</h2>
            <div className="rs-list">
                {results.map((r) => (
                    <button
                        key={r.id}
                        type="button"
                        className="rs-item"
                        onClick={() => onSelectResult && onSelectResult(r.id)}
                    >
                        {r.title}
                    </button>
                ))}
            </div>
        </aside>
    );
}
