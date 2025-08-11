import React from "react";

export default function TemplatesEmpty({ onCreate }) {
  return (
    <div className="card" style={{ padding: 16, textAlign: "center" }}>
      <h3>Шаблонів не знайдено</h3>
      <p style={{ color: "var(--text-muted)" }}>Створіть перший шаблон, щоб швидше планувати повторювані задачі.</p>
      <button className="btn primary" onClick={onCreate}>Додати шаблон</button>
    </div>
  );
}
