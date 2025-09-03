import React, { useEffect, useState } from "react";
import "./OrgTable.css";
import { getFlat, updatePosition } from "../../../services/api/org";

/**
 * OrgTable – табличне представлення оргструктури з інлайн‑редагуванням,
 * масовими діями та підтримкою фільтрів/пошуку.
 */
export default function OrgTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    q: "",
    div: "any",
    status: "any",
    noKpi: false,
    noSuccessor: false,
  });
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, [filters]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = {};
      if (filters.q) params.q = filters.q;
      if (filters.div !== "any") params.div = filters.div;
      if (filters.status !== "any") params.status = filters.status;
      if (filters.noKpi) params.noKpi = true;
      if (filters.noSuccessor) params.noSuccessor = true;
      const data = await getFlat(params);
      setRows(data);
    } catch (e) {
      console.error("Не вдалося завантажити список", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleInline = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    updatePosition(id, { [field]: value }).catch(() => {});
  };

  const handleBulk = (patch) => {
    const ids = [...selected];
    setRows((prev) =>
      prev.map((r) => (selected.has(r.id) ? { ...r, ...patch } : r))
    );
    ids.forEach((id) => updatePosition(id, patch).catch(() => {}));
    setSelected(new Set());
  };

  const resetFilters = () =>
    setFilters({ q: "", div: "any", status: "any", noKpi: false, noSuccessor: false });

  return (
    <div className="org-table-wrapper">
      <div className="ot-filters">
        <input
          type="search"
          className="input"
          placeholder="Пошук..."
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />
        <select
          className="input"
          value={filters.div}
          onChange={(e) => setFilters({ ...filters, div: e.target.value })}
        >
          <option value="any">Усі Div</option>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>
              Div {n}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="any">Будь‑який статус</option>
          <option value="active">Активні</option>
          <option value="dismissed">Звільнені</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={filters.noKpi}
            onChange={(e) => setFilters({ ...filters, noKpi: e.target.checked })}
          />
          Без ЦКП
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.noSuccessor}
            onChange={(e) =>
              setFilters({ ...filters, noSuccessor: e.target.checked })
            }
          />
          Без наступника
        </label>
        <button className="btn ghost" onClick={resetFilters}>
          Скинути
        </button>
      </div>

      {selected.size > 0 && (
        <div className="ot-bulk-actions">
          <span>Обрано: {selected.size}</span>
          <button
            className="btn"
            onClick={() => handleBulk({ owner: null })}
          >
            Змінити відповідального
          </button>
          <button
            className="btn"
            onClick={() => handleBulk({ divisionId: null })}
          >
            Перевести
          </button>
          <button
            className="btn"
            onClick={() => handleBulk({ status: "dismissed" })}
          >
            Позначити звільненими
          </button>
          <button className="btn" onClick={() => alert("Експорт...")}>Експорт</button>
        </div>
      )}

      <table className="table org-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelected(
                    e.target.checked ? new Set(rows.map((r) => r.id)) : new Set()
                  )
                }
              />
            </th>
            <th>Посада</th>
            <th>Працівник(и)</th>
            <th>Відділ/Div</th>
            <th>ЦКП</th>
            <th>Поточний відп.</th>
            <th>Наступний відп.</th>
            <th>Статус</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan="9">Завантаження...</td>
            </tr>
          )}
          {!loading &&
            rows.map((r) => (
              <tr key={r.id} className="row-hover">
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleSelect(r.id)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={r.title || ""}
                    onChange={(e) => handleInline(r.id, "title", e.target.value)}
                  />
                </td>
                <td>{(r.employees || []).map((emp) => emp.full_name).join(", ") || "—"}</td>
                <td>
                  <input
                    className="input"
                    value={r.divisionName || ""}
                    onChange={(e) =>
                      handleInline(r.id, "divisionName", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={r.kpi || ""}
                    onChange={(e) => handleInline(r.id, "kpi", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={r.owner?.full_name || ""}
                    onChange={(e) =>
                      handleInline(r.id, "ownerName", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={r.successor?.full_name || ""}
                    onChange={(e) =>
                      handleInline(r.id, "successorName", e.target.value)
                    }
                  />
                </td>
                <td>
                  {(r.employees || []).some((emp) => emp.status === "dismissed")
                    ? "звільнений"
                    : "активний"}
                </td>
                <td className="actions">
                  <button className="btn ghost" onClick={() => alert("TODO")}>Дії</button>
                </td>
              </tr>
            ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan="9">Нічого не знайдено</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
