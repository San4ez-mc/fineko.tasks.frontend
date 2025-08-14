import React from "react";
import "./InstructionItem.css";

export default function InstructionItem({ instruction }) {
    const editors = (instruction.editors || []).map((u) => u.name || u).join(", ") || "—";
    const viewers = (instruction.viewers || []).map((u) => u.name || u).join(", ") || "—";

    return (
        <div className="instruction-item card">
            <h2 className="instruction-item__title">{instruction.title}</h2>
            {instruction.body && (
                <div className="instruction-item__body">{instruction.body}</div>
            )}
            <div className="instruction-item__access">
                <div className="instruction-item__editors">
                    <strong>Можуть редагувати:</strong> {editors}
                </div>
                <div className="instruction-item__viewers">
                    <strong>Можуть переглядати:</strong> {viewers}
                </div>
            </div>
        </div>
    );
}
