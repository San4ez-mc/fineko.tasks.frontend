import React from "react";

export default function Pagination({ page, pageCount, onChange }) {
    if (!pageCount || pageCount <= 1) return null;
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

    return (
        <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {pages.map((p) => (
                <button key={p} disabled={p === page} onClick={() => onChange?.(p)}>
                    {p}
                </button>
            ))}
        </div>
    );
}
