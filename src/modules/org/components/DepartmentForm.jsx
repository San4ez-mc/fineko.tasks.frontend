import React, { useState } from "react";

/**
 * Формa додавання відділу.
 * Вимагає назву, ЦКП та відповідального.
 */
export default function DepartmentForm({ divisions = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    productValue: "",
    divisionId: divisions[0]?.id || "",
    head: "",
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
      const head = form.head ? { name: form.head } : null;
      await onSubmit({
        name: form.name,
        divisionId: form.divisionId,
        productValue: form.productValue,
        head,
      });
      setForm({ name: "", productValue: "", divisionId: divisions[0]?.id || "", head: "" });
      onCancel && onCancel();
    } catch {
      alert("Помилка створення відділу");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="olp-tr" onSubmit={handleSubmit}>
      <div className="name">
        <input
          className="input"
          name="name"
          required
          placeholder="Назва"
          value={form.name}
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
          name="head"
          required
          placeholder="Відповідальний"
          value={form.head}
          onChange={handleChange}
        />
      </div>
      <div className="dept">
        <select
          className="input"
          name="divisionId"
          required
          value={form.divisionId}
          onChange={handleChange}
        >
          {divisions.map((d) => (
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

