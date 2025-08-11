import React from "react";
import "../styles/global.css";
import CheckToggle from "../components/ui/CheckToggle";
import "../components/ui/CheckToggle.css";

export default function StyleKit() {
    return (
        <div style={{ padding: "24px", display: "grid", gap: "32px" }}>
            <h1>FINEKO • Style Kit</h1>

            {/* Кнопки */}
            <section className="card" style={{ padding: "18px" }}>
                <h2>Кнопки</h2>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: 12 }}>
                    <button className="btn primary">Primary</button>
                    <button className="btn">Default</button>
                    <button className="btn ghost">Ghost</button>
                    <button className="btn" disabled>Disabled</button>
                </div>
            </section>

            {/* Бейджі */}
            <section className="card" style={{ padding: "18px" }}>
                <h2>Бейджі</h2>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: 12 }}>
                    <span className="badge critical">Терміново-важлива</span>
                    <span className="badge important">Важлива</span>
                    <span className="badge rush">Термінова</span>
                    <span className="badge neutral">Звичайна</span>
                </div>
            </section>

            {/* Таблиця */}
            <section className="card" style={{ padding: "18px" }}>
                <h2>Таблиця</h2>
                <table className="table" style={{ width: "100%", marginTop: 12 }}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Назва</th>
                            <th>Статус</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Підготувати звіт</td>
                            <td><span className="badge critical">Терміново</span></td>
                            <td>2025-08-12</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>План на тиждень</td>
                            <td><span className="badge important">Важлива</span></td>
                            <td>2025-08-15</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Картка */}
            <section className="card" style={{ padding: "18px" }}>
                <h2>Картка</h2>
                <div className="card" style={{ padding: "14px", marginTop: "12px" }}>
                    <h3>Приклад картки</h3>
                    <p style={{ color: "var(--text-muted)" }}>
                        Це приклад картки, яку можна використовувати для задач, результатів або статистики.
                    </p>
                </div>
            </section>

            {/* Інпути */}
            <section className="card" style={{ padding: "18px" }}>
                <h2>Інпути</h2>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: 12 }}>
                    <input type="text" placeholder="Введіть текст" className="input" />
                    <input type="email" placeholder="Email" className="input" />
                </div>
            </section>

            {/* Чекбокси з іконкою */}
            <section className="card" style={{ padding: "18px" }}>
                <h2>Чекбокси з іконкою</h2>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: 12 }}>
                    <CheckToggle checked={false} onChange={() => { }} />
                    <CheckToggle checked={true} onChange={() => { }} />
                </div>
            </section>
        </div>
    );
}
