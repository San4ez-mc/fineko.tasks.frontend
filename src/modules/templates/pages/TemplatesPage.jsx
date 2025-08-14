import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../../components/layout/Layout";
import "./TemplatesPage.css";
import VoiceInput from "../../../shared/components/VoiceInput";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../templates/api/templatesApi";

const FIELD_LABELS = {
  title: "Назва задачі",
  expected_result: "Очікуваний результат",
  result: "Результат",
  type: "Тип",
  planned_time: "Запланований час",
  actual_time: "Фактичний час",
  manager: "Хто назначив",
  comments: "Коментарі",
  resultId: "ID результату",
  repeat: "Повторення",
};

const defaultFlags = {
  title: true,
  expected_result: true,
  result: true,
  type: true,
  planned_time: true,
  actual_time: true,
  manager: true,
  comments: true,
  resultId: true,
  repeat: true,
};

const defaultPayload = {
  title: "",
  expected_result: "",
  result: "",
  type: "важлива термінова",
  planned_time: "00:00",
  actual_time: "00:00",
  manager: "",
  comments: "",
  resultId: "",
  repeat: { type: "none", interval: 1 },
};

function FlagsBadge({ flags = {} }) {
  const enabled = Object.keys(flags).filter((k) => flags[k]);
  if (!enabled.length) return <span className="badge muted">Порожній</span>;
  return (
    <div className="flags">
      {enabled.map((k) => (
        <span key={k} className="badge">
          {FIELD_LABELS[k] || k}
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
    flags: { ...defaultFlags },
    payload: { ...defaultPayload },
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
      flags: { ...defaultFlags },
      payload: { ...defaultPayload },
    });
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setForm({
      id: t.id,
      name: t.name || "",
      flags: { ...defaultFlags, ...(t.flags || {}) },
      payload: {
        title: t.payload?.title ?? "",
        expected_result: t.payload?.expected_result ?? "",
        result: t.payload?.result ?? "",
        type: t.payload?.type ?? "важлива термінова",
        planned_time: t.payload?.planned_time ?? "00:00",
        actual_time: t.payload?.actual_time ?? "00:00",
        manager: t.payload?.manager ?? "",
        comments: t.payload?.comments ?? "",
        resultId: t.payload?.resultId ?? "",
        repeat: t.payload?.repeat ?? { type: "none", interval: 1 },
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
          repeat:
            form.payload.repeat?.type === "custom"
              ? {
                  type: "custom",
                  interval: Number(form.payload.repeat.interval || 1),
                }
              : { type: form.payload.repeat?.type || "none", interval: 1 },
        },
      };

  const handleVoiceTemplate = (data) => {
    setForm((s) => ({
      ...s,
      name: data.name || s.name,
      flags: { ...s.flags, ...(data.flags || {}) },
      payload: { ...s.payload, ...(data.payload || {
        title: data.title,
        expected_result: data.expected_result,
        result: data.result,
        type: data.type,
        planned_time: data.planned_time,
        actual_time: data.actual_time,
        manager: data.manager,
        comments: data.comments,
        resultId: data.resultId,
        repeat: data.repeat
      })}
    }));
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
              <VoiceInput endpoint="/templates/voice" onResult={handleVoiceTemplate} />
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

              <div className="group">
                <div className="group-title">Значення полів</div>

                    <label className="field">
                      <span>Назва задачі</span>
                      <input
                        className="input"
                        value={form.payload.title}
                        onChange={(e) => setPayload("title", e.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>Очікуваний результат</span>
                      <textarea
                        className="input"
                        value={form.payload.expected_result}
                        onChange={(e) => setPayload("expected_result", e.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>Результат</span>
                      <textarea
                        className="input"
                        value={form.payload.result}
                        onChange={(e) => setPayload("result", e.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>Тип</span>
                      <select
                        className="input"
                        value={form.payload.type}
                        onChange={(e) => setPayload("type", e.target.value)}
                      >
                        <option value="важлива термінова">Важлива - термінова</option>
                        <option value="важлива нетермінова">Важлива - не термінова</option>
                        <option value="неважлива термінова">Неважлива - термінова</option>
                        <option value="неважлива нетермінова">Неважлива - нетермінова</option>
                      </select>
                    </label>

                <div className="row2">
                      <label className="field">
                        <span>Запланований час</span>
                        <input
                          className="input"
                          type="time"
                          value={form.payload.planned_time}
                          onChange={(e) => setPayload("planned_time", e.target.value)}
                        />
                      </label>

                      <label className="field">
                        <span>Фактичний час</span>
                        <input
                          className="input"
                          type="time"
                          value={form.payload.actual_time}
                          onChange={(e) => setPayload("actual_time", e.target.value)}
                        />
                      </label>
                    </div>

                    <label className="field">
                      <span>Хто назначив</span>
                      <input
                        className="input"
                        value={form.payload.manager}
                        onChange={(e) => setPayload("manager", e.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>Коментарі</span>
                      <textarea
                        className="input"
                        value={form.payload.comments}
                        onChange={(e) => setPayload("comments", e.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>ID результату</span>
                      <input
                        className="input"
                        value={form.payload.resultId}
                        onChange={(e) => setPayload("resultId", e.target.value)}
                      />
                    </label>

                    <div className="row2">
                      <label className="field">
                        <span>Повторення</span>
                        <select
                          className="input"
                          value={form.payload.repeat.type}
                          onChange={(e) =>
                            setPayload("repeat", {
                              ...form.payload.repeat,
                              type: e.target.value,
                            })
                          }
                        >
                          <option value="none">Не повторювати</option>
                          <option value="daily">Щодня</option>
                          <option value="weekly">Щотижня</option>
                          <option value="monthly">Щомісяця</option>
                          <option value="yearly">Щороку</option>
                          <option value="custom">Кожні N днів</option>
                        </select>
                      </label>

                      {form.payload.repeat.type === "custom" && (
                        <label className="field">
                          <span>Кількість днів</span>
                          <input
                            className="input"
                            type="number"
                            min="2"
                            value={form.payload.repeat.interval}
                            onChange={(e) =>
                              setPayload("repeat", {
                                ...form.payload.repeat,
                                interval: Number(e.target.value),
                              })
                            }
                          />
                        </label>
                      )}
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

