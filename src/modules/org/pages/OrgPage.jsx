import React, { useEffect, useMemo, useState } from "react";
import "../components/OrgLeftPanel.css";
import "../components/OrgCanvas.css";
import "./OrgPage.css";

import OrgLeftPanel from "../components/OrgLeftPanel";
import OrgCanvas from "../components/OrgCanvas";
import { createPosition, createDepartment, updatePosition as apiUpdatePosition, getOrgTree, getOrgPositions } from "../../../services/api/org";

/**
 * OrgPage – контейнер сторінки оргструктури.
 * TODO: PATCH/POST/DELETE ... -> передати у хендлери нижче
 */
export default function OrgPage() {
  const [tree, setTree] = useState([]);
  const [positions, setPositions] = useState([]);
  const [filters, setFilters] = useState({ q: "", divisionId: "any", departmentId: "any", role: "any" });
  const [highlightIds, setHighlightIds] = useState(new Set());
  const [expanded, setExpanded] = useState(() => loadExpanded());
  const [view, setView] = useState("scheme");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [treeData, posData] = await Promise.all([
          getOrgTree(),
          getOrgPositions(),
        ]);
        if (cancelled) return;
        setTree(parseTree(treeData));
        setPositions(parsePositions(posData));
      } catch (e) {
        console.error(e);
        if (!cancelled) alert("Не вдалося завантажити оргструктуру");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // пошук у лівій панелі -> підсвітити вузли на канвасі
  const handleSearch = (q) => {
    setFilters((f) => ({ ...f, q }));
    const ids = new Set(findNodeIdsByQuery(tree, q));
    setHighlightIds(ids);
  };

  // оновлення unit/position (inline-редагування, продукт, керівники тощо)
  const handleUpdateUnit = (id, patch) => {
    setTree((prev) => updateUnit(prev, id, patch));
    // TODO: PATCH /org/unit/{id}
  };
  const handleUpdatePosition = (id, patch) => {
    setPositions((prev) => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    apiUpdatePosition(id, patch).catch(()=>{});
  };

  const handleCreatePosition = async (data) => {
    try {
      const newP = await createPosition(data);
      setPositions(prev => [...prev, newP]);
      setTree(prev => addPosition(prev, newP));
    } catch {
      alert("Помилка створення посади");
    }
  };

  const handleCreateDepartment = async (data) => {
    try {
      const newDep = await createDepartment(data);
      setTree(prev => addDepartment(prev, newDep));
    } catch {
      alert("Помилка створення відділу");
    }
  };

  const handleFocusPosition = (id) => {
    setHighlightIds(new Set([id]));
    setTimeout(() => {
      const el = document.querySelector('.org-canvas .org-node.is-highlighted');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  };

  // DnD переміщення
  const handleMove = ({ entity, id, targetId }) => {
    setTree((prev) => moveEntity(prev, entity, id, targetId));
    // TODO: PATCH /org/move { entity, id, targetId }
  };

  // заміна працівника в позиції
  const handleReplaceUser = (positionId, newUser) => {
    setPositions((prev) => prev.map(p => p.id === positionId ? { ...p, user: newUser } : p));
    // TODO: PATCH /org/position/{id}/replaceUser
  };

  // зберігати стан розгортання
  const toggleExpand = (nodeKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(nodeKey) ? next.delete(nodeKey) : next.add(nodeKey);
      localStorage.setItem("org.expanded", JSON.stringify([...next]));
      return next;
    });
  };

  // фільтровані позиції для лівої панелі
  const filteredPositions = useMemo(
    () => filterPositions(positions, filters),
    [positions, filters]
  );
  const divisions = useMemo(() => tree.map(div => ({ id: div.id, name: div.name })), [tree]);
  const departments = useMemo(() => {
    const arr = [];
    tree.forEach(div => div.departments.forEach(dep => arr.push({ id: dep.id, name: dep.name, divisionId: div.id })));
    return arr;
    }, [tree]);

  const leftPanel = (
    <OrgLeftPanel
      positions={filteredPositions}
      divisions={divisions}
      departments={departments}
      filters={filters}
      onFiltersChange={setFilters}
      onSearch={handleSearch}
      onUpdatePosition={handleUpdatePosition}
      onCreatePosition={handleCreatePosition}
      onCreateDepartment={handleCreateDepartment}
      onFocusPosition={handleFocusPosition}
    />
  );

  return (
    <div>
      <div className="org-page-header">
        <h2>Оргструктура</h2>
        <div className="org-view-switch">
          <button
            className={view === "scheme" ? "btn" : "btn ghost"}
            onClick={() => setView("scheme")}
          >
            Схема
          </button>
          <button
            className={view === "table" ? "btn" : "btn ghost"}
            onClick={() => setView("table")}
          >
            Таблиця
          </button>
        </div>
      </div>

      {view === "scheme" ? (
        <div className="org-layout">
          <aside className="org-left card">{leftPanel}</aside>
          <main className="org-canvas">
            <OrgCanvas
              tree={tree}
              expanded={expanded}
              onToggleExpand={toggleExpand}
              highlightIds={highlightIds}
              onUpdateUnit={handleUpdateUnit}
              onMove={handleMove}
              onReplaceUser={handleReplaceUser}
            />
          </main>
        </div>
      ) : (
        <div className="org-table-view">{leftPanel}</div>
      )}
    </div>
  );
}

/* ----------------- helpers ----------------- */
function parseTree(data) {
  return (data || []).map(div => ({
    id: div.id,
    type: "division",
    name: div.name,
    head: div.head || null,
    productValue: div.productValue || "",
    order: div.order,
    departments: (div.departments || []).map(dep => ({
      id: dep.id,
      type: "department",
      name: dep.name,
      head: dep.head || null,
      productValue: dep.productValue || "",
      order: dep.order,
      employees: (dep.positions || dep.employees || []).map(p => ({
        id: p.id,
        type: "position",
        title: p.title,
        user: p.user || null,
      })),
    })),
  }));
}
function parsePositions(list) {
  return (list || []).map(p => ({
    id: p.id,
    title: p.title,
    user: p.user || null,
    managers: p.managers || [],
    departmentId: p.department?.id || null,
    divisionId: p.department?.division?.id || null,
    departmentName: p.department?.name || "",
    divisionName: p.department?.division?.name || "",
    isManager: p.isManager ?? p.is_manager ?? false,
  }));
}
function findNodeIdsByQuery(tree, q) {
  if (!q) return [];
  const s = q.toLowerCase();
  const ids = [];
  const walk = (d) => {
    d.forEach(div => {
      if (div.name.toLowerCase().includes(s) || (div.head?.name || "").toLowerCase().includes(s)) ids.push(div.id);
      div.departments.forEach(dep => {
        if (dep.name.toLowerCase().includes(s) || (dep.head?.name || "").toLowerCase().includes(s)) ids.push(dep.id);
        dep.employees.forEach(p => {
          if ((p.title || "").toLowerCase().includes(s) || (p.user?.name || "").toLowerCase().includes(s)) ids.push(p.id);
        });
      });
    });
  };
  walk(tree);
  return ids;
}
function filterPositions(list, f) {
  return list.filter(p => {
    if (f.q) {
      const s = f.q.toLowerCase();
      const hit = (p.title||"").toLowerCase().includes(s)
        || (p.user?.name||"").toLowerCase().includes(s)
        || (p.departmentName||"").toLowerCase().includes(s)
        || (p.divisionName||"").toLowerCase().includes(s);
      if (!hit) return false;
    }
    if (f.divisionId !== "any" && p.divisionId !== f.divisionId) return false;
    if (f.departmentId !== "any" && p.departmentId !== f.departmentId) return false;
    if (f.role === "manager" && !p.isManager) return false;
    return true;
  });
}
function updateUnit(tree, id, patch) {
  const next = JSON.parse(JSON.stringify(tree));
  const apply = (node) => {
    if (node.id === id) Object.assign(node, patch);
    if (node.departments) node.departments.forEach(apply);
  };
  next.forEach(apply);
  return next;
}
function moveEntity(tree, entity, id, targetId) {
  const next = JSON.parse(JSON.stringify(tree));
  let dragged = null;
  // remove
  next.forEach(div => {
    div.departments = div.departments.filter(dep => {
      if (entity === "department" && dep.id === id) { dragged = dep; return false; }
      dep.employees = dep.employees.filter(p => {
        if (entity === "position" && p.id === id) { dragged = p; return false; }
        return true;
      });
      return true;
    });
  });
  // insert
  if (dragged) {
    next.forEach(div => {
      if (entity === "department" && div.id === targetId) {
        div.departments.push(dragged);
      }
      div.departments.forEach(dep => {
        if (entity === "position" && dep.id === targetId) dep.employees.push(dragged);
      });
    });
  }
  return next;
}
function loadExpanded() {
  try { return new Set(JSON.parse(localStorage.getItem("org.expanded") || "[]")); } catch { return new Set(); }
}

function addPosition(tree, p) {
  const next = JSON.parse(JSON.stringify(tree));
  next.forEach(div => div.departments.forEach(dep => {
    if (dep.id === p.departmentId) {
      dep.employees.push({ id: p.id, type: "position", title: p.title, user: p.user, isManager: p.isManager });
    }
  }));
  return next;
}

function addDepartment(tree, dep) {
  const next = JSON.parse(JSON.stringify(tree));
  next.forEach(div => {
    if (div.id === dep.divisionId) {
      div.departments.push({
        id: dep.id,
        type: "department",
        name: dep.name,
        head: dep.head || null,
        productValue: dep.productValue || "",
        order: 0,
        employees: []
      });
    }
  });
  return next;
}
