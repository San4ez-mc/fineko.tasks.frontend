import React from "react";
import "./InstructionItem.css";

export default function InstructionItem({ instruction, onClick }) {
    return (
        <div
            className="instruction-item card"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onClick?.();
                }
            }}
        >
            <span className="instruction-item__icon" aria-hidden="true">📄</span>
            <span className="instruction-item__title">{instruction.title}</span>
        </div>
    );
}
