import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "./BusinessProcessesPage.css";

export default function BusinessProcessesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/business-processes");
        setItems(Array.isArray(data) ? data : data?.items || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createNew = () => navigate("/business-processes/new");

  if (loading) return <div className="bp-list-page">Завантаження…</div>;

  return (
    <div className="bp-list-page">
      <div className="bp-list-header">
        <h2>Бізнес‑процеси</h2>
        <button className="btn" onClick={createNew}>Створити процес</button>
      </div>
      {items.length === 0 ? (
        <div>Поки немає процесів</div>
      ) : (
        <div className="bp-list-items">
          {items.map((p) => (
            <div key={p.id} className="bp-list-item">
              <div className="bp-list-item-name">{p.name}</div>
              <div className="bp-list-item-actions">
                <Link className="btn ghost" to={`/business-processes/${p.id}/edit`}>Редагувати</Link>
                <Link className="btn ghost" to={`/business-processes/${p.id}`}>Переглянути</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
