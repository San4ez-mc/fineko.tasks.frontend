import React, { useState } from "react";

/**
 * Формa додавання посади.
 * Вимагає назву, ЦКП та відповідальних.
 */
export default function PositionForm({ departments = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    productValue: "",
    departmentId: departments[0]?.id || "",
    managers: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    setSaving(true);
    try {
      const managers = form.managers
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({ id: `tmp-${i}`, name }));
      await onSubmit({
        title: form.title,
        departmentId: form.departmentId,
        productValue: form.productValue,
        managers,
      });
      setForm({ title: "", productValue: "", departmentId: departments[0]?.id || "", managers: "" });
      onCancel && onCancel();
    } catch {
      alert("Помилка створення посади");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="olp-tr" onSubmit={handleSubmit}>
      <div className="name">
        <input
          className="input"
          name="title"
          required
          placeholder="Назва"
          value={form.title}
          onChange={handleChange}
        />
        <input
          className="input"
          name="productValue"
          required
          placeholder="ЦКП"
          value={form.productValue}
          onChange={handleChange}
          style={{ marginTop: 4 }}
        />
      </div>
      <div className="managers">
        <input
          className="input"
          name="managers"
          required
          placeholder="Відповідальні (через кому)"
          value={form.managers}
          onChange={handleChange}
        />
      </div>
      <div className="dept">
        <select
          className="input"
          name="departmentId"
          required
          value={form.departmentId}
          onChange={handleChange}
        >
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="actions">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "…" : "Зберегти"}
        </button>
        {onCancel && (
          <button className="btn ghost" type="button" onClick={onCancel}>
            Скасувати
          </button>
        )}
      </div>
    </form>
  );
}

