import React from "react";
import "./CheckToggle.css";

/** Аксесибельний чекбокс з великим хіт-ареа та анімацією */
export default function CheckToggle({ checked, onChange, ariaLabel = "Позначити виконаним" }) {
    return (
        <button
            type="button"
            className={`check-toggle ${checked ? "on" : ""}`}
            aria-pressed={checked}
            aria-label={ariaLabel}
            onClick={onChange}
        >
            <span className="box" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="tick">
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
        </button>
    );
}
