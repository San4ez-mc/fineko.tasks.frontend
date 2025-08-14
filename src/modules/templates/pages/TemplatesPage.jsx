import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../../components/layout/Layout";
import "./TemplatesPage.css";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../templates/api/templatesApi";

function FlagsBadge({ flags = {} }) {
  const enabled = Object.keys(flags).filter((k) => flags[k]);
  if (!enabled.length) return <span className="badge muted">Порожній</span>;
  return (
    <div className="flags">
      {enabled.map((k) => (
        <span key={k} className="badge">
          {k}
        </span>
      ))}
    </div>
  );
}

function RowActions({ onEdit, onDelete, busy }) {
  return (
    <div className="row-actions">
      <button className="btn xs ghost" onClick={onEdit} disabled={busy} title="Редагувати">
        ✏️
      </button>
      <button
        className="btn xs danger"
        onClick={onDelete}
        disabled={busy}
        title="Видалити"
      >
        🗑️
      </button>
    </div>
  );
}

export default function TemplatesPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    flags: {
      title: true,
      final_result: true,
      description: true,
      urgent: true,
      responsible_id: true,
      date: true,
      due_date: true,
    },
    payload: {
      title: "",
      final_result: "",
      description: "",
      urgent: false,
      responsible_id: null,
      date: "",
      due_date: "",
    },
  });
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listTemplates();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Не вдалося завантажити шаблони");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter((x) => (x.name || "").toLowerCase().includes(s));
  }, [items, q]);

  const openCreate = () => {
    setForm({
      id: null,
      name: "",
      flags: {
        title: true,
        final_result: true,
        description: true,
        urgent: true,
        responsible_id: true,
        date: true,
        due_date: true,
      },
      payload: {
        title: "",
        final_result: "",
        description: "",
        urgent: false,
        responsible_id: null,
        date: "",
        due_date: "",
      },
    });
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setForm({
      id: t.id,
      name: t.name || "",
      flags: {
        title: !!t.flags?.title,
        final_result: !!t.flags?.final_result,
        description: !!t.flags?.description,
        urgent: !!t.flags?.urgent,
        responsible_id: !!t.flags?.responsible_id,
        date: !!t.flags?.date,
        due_date: !!t.flags?.due_date,
      },
      payload: {
        title: t.payload?.title ?? "",
        final_result: t.payload?.final_result ?? "",
        description: t.payload?.description ?? "",
        urgent: !!t.payload?.urgent,
        responsible_id:
          t.payload?.responsible_id === null ? null : Number(t.payload?.responsible_id || 0),
        date: t.payload?.date ?? "",
        due_date: t.payload?.due_date ?? "",
      },
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        flags: form.flags,
        payload: {
          ...form.payload,
          responsible_id:
            form.payload.responsible_id === "" || form.payload.responsible_id === null
              ? null
              : Number(form.payload.responsible_id),
        },
      };
      if (!payload.name) {
        setError("Назва шаблону обов’язкова");
        return;
      }
      if (form.id) {
        setBusyId(form.id);
        await updateTemplate(form.id, payload);
      } else {
        setBusyId(-1);
        await createTemplate(payload);
      }
      setModalOpen(false);
      setBusyId(null);
      await load();
    } catch (e2) {
      setBusyId(null);
      setError(e2?.response?.data?.message || "Помилка збереження");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Видалити шаблон? Дію неможливо скасувати.")) return;
    setBusyId(id);
    try {
      await deleteTemplate(id);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Не вдалося видалити шаблон");
    } finally {
      setBusyId(null);
    }
  };

  const setFlag = (key, val) =>
    setForm((s) => ({ ...s, flags: { ...s.flags, [key]: val } }));

  const setPayload = (key, val) =>
    setForm((s) => ({ ...s, payload: { ...s.payload, [key]: val } }));

  return (
    <Layout>
      <div className="templates-page">
        <div className="tp-head">
          <h1>Шаблони</h1>
          <div className="tp-actions">
            <input
              className="input"
              placeholder="Пошук за назвою…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn primary" onClick={openCreate}>
              + Новий шаблон
            </button>
          </div>
        </div>

        {error && <div className="tp-error">{error}</div>}

        <div className="tp-table card">
          <div className="tp-row tp-row--head">
            <div className="c-name">Назва</div>
            <div className="c-flags">Що зберігає</div>
            <div className="c-meta">Оновлено</div>
            <div className="c-actions">Дії</div>
          </div>
          {loading ? (
            <div className="tp-empty">Завантаження…</div>
          ) : filtered.length ? (
            filtered.map((t) => (
              <div key={t.id} className="tp-row">
                <div className="c-name">{t.name}</div>
                <div className="c-flags"><FlagsBadge flags={t.flags} /></div>
                <div className="c-meta">
                  {t.updated_at
                    ? new Date(t.updated_at * 1000).toLocaleString()
                    : "—"}
                </div>
                <div className="c-actions">
                  <RowActions
                    busy={busyId === t.id}
                    onEdit={() => openEdit(t)}
                    onDelete={() => onDelete(t.id)}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="tp-empty">Поки що немає шаблонів</div>
          )}
        </div>

      {modalOpen && (
        <div className="tp-modal">
          <div className="tp-modal__dialog card">
            <div className="tp-modal__head">
              <h2>{form.id ? "Редагувати шаблон" : "Новий шаблон"}</h2>
              <button className="btn xs ghost" onClick={() => setModalOpen(false)}>✖</button>
            </div>

            <form onSubmit={onSubmit} className="tp-modal__body">
              <label className="field">
                <span>Назва шаблону*</span>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Наприклад: Щоденний результат"
                  required
                />
              </label>

              <div className="grid">
                <div className="col">
                  <div className="group">
                    <div className="group-title">Поля для збереження</div>
                    {Object.entries(form.flags).map(([k, v]) => (
                      <label key={k} className="chk">
                        <input
                          type="checkbox"
                          checked={!!v}
                          onChange={(e) => setFlag(k, e.target.checked)}
                        />
                        <span>{k}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="col">
                  <div className="group">
                    <div className="group-title">Значення полів</div>

                    <label className="field">
                      <span>title</span>
                      <input
                        className="input"
                        value={form.payload.title}
                        onChange={(e) => setPayload("title", e.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>final_result</span>
                      <input
                        className="input"
                        value={form.payload.final_result}
                        onChange={(e) => setPayload("final_result", e.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>description</span>
                      <textarea
                        className="input"
                        value={form.payload.description}
                        onChange={(e) => setPayload("description", e.target.value)}
                      />
                    </label>

                    <label className="field row">
                      <span>urgent</span>
                      <input
                        type="checkbox"
                        checked={!!form.payload.urgent}
                        onChange={(e) => setPayload("urgent", e.target.checked)}
                      />
                    </label>

                    <label className="field">
                      <span>responsible_id</span>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                        value={form.payload.responsible_id ?? ""}
                        onChange={(e) =>
                          setPayload(
                            "responsible_id",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                      />
                    </label>

                    <div className="row2">
                      <label className="field">
                        <span>date (YYYY-MM-DD)</span>
                        <input
                          className="input"
                          type="date"
                          value={form.payload.date}
                          onChange={(e) => setPayload("date", e.target.value)}
                        />
                      </label>

                      <label className="field">
                        <span>due_date (HH:mm)</span>
                        <input
                          className="input"
                          placeholder="09:30"
                          value={form.payload.due_date}
                          onChange={(e) => setPayload("due_date", e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="tp-error">{error}</div>}

              <div className="tp-modal__foot">
                <button className="btn ghost" type="button" onClick={() => setModalOpen(false)}>
                  Скасувати
                </button>
                <button className="btn primary" type="submit" disabled={busyId !== null}>
                  {form.id ? "Зберегти" : "Створити"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}

