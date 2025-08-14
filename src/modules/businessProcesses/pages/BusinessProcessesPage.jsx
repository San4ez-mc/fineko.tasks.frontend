import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import "./BusinessProcessesPage.css";
import api from "../../../services/api";

export default function BusinessProcessesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      // TODO: замінити на реальний ендпоінт, коли буде готовий бек
      // приклад: const r = await api.get("/business-processes", { params: { q } });
      // setItems(r.data || []);
      setItems([]); // порожній стан до інтеграції
    } catch (e) {
      setError(e?.response?.data?.message || "Не вдалося завантажити бізнес‑процеси");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = () => {
    // TODO: відкривати модалку/сторінку створення процесу
    alert("Створення бізнес‑процесу (скоро)");
  };

  const filtered = q.trim()
    ? items.filter((x) => (x.name || "").toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <Layout title="Бізнес процеси">
      <div className="bp">
        <div className="bp-head">
          <h1>Бізнес процеси</h1>
          <div className="bp-actions">
            <input
              className="input"
              placeholder="Пошук за назвою…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn primary" onClick={onCreate}>+ Новий процес</button>
          </div>
        </div>

        {error && <div className="bp-error">{error}</div>}

        {/* Порожній стан */}
        {!loading && filtered.length === 0 && (
          <div className="card bp-empty">
            <div className="bp-empty__icon">🏗️</div>
            <div className="bp-empty__title">Поки що немає бізнес‑процесів</div>
            <div className="bp-empty__text">
              Створіть перший процес — опишіть кроки, ролі та показники. Усе в єдиному місці.
            </div>
            <div className="bp-empty__actions">
              <button className="btn primary" onClick={onCreate}>Створити процес</button>
              <button className="btn ghost" onClick={load}>Оновити</button>
            </div>
          </div>
        )}

        {/* Список (плейсхолдер під майбутню інтеграцію) */}
        {loading && <div className="bp-loading">Завантаження…</div>}

        {!loading && filtered.length > 0 && (
          <div className="bp-list">
            {filtered.map((bp) => (
              <div key={bp.id} className="bp-item card">
                <div className="bp-item__top">
                  <div className="bp-item__title">{bp.name}</div>
                  <div className="bp-item__actions">
                    <button className="btn xs ghost" title="Редагувати">✏️</button>
                    <button className="btn xs danger" title="Видалити">🗑️</button>
                  </div>
                </div>
                <div className="bp-item__meta">
                  Оновлено: {bp.updated_at ? new Date(bp.updated_at * 1000).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

