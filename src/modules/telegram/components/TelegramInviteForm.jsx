import React from "react";

export default function TelegramInviteForm({
    inviteCode,
    companyId,
    companies = [],
    onInviteCodeChange,
    onCompanyChange,
    onSubmit,
    onCancel,
}) {
    return (
        <form onSubmit={onSubmit} className="link-form">
            <input
                type="text"
                value={inviteCode}
                onChange={(e) => onInviteCodeChange(e.target.value)}
                placeholder="Код запрошення"
                required
            />
            <select value={companyId} onChange={(e) => onCompanyChange(e.target.value)} required>
                <option value="">Оберіть компанію</option>
                {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>
            <button className="btn primary" type="submit">
                Підключити
            </button>
            {onCancel && (
                <button type="button" className="btn" onClick={onCancel}>
                    Скасувати
                </button>
            )}
        </form>
    );
}
