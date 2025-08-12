import React, { useEffect, useMemo, useRef, useState } from "react";
import "../components/OrgLeftPanel.css";
import "../components/OrgCanvas.css";
import "./OrgPage.css";

import OrgLeftPanel from "../components/OrgLeftPanel";
import OrgCanvas from "../components/OrgCanvas";

/**
 * OrgPage – контейнер сторінки оргструктури.
 * TODO: Підключити реальні дані через API:
 *   - GET /org/tree         -> setTree(...)
 *   - GET /org/positions    -> setPositions(...)
 *   - PATCH/POST/DELETE ... -> передати у хендлери нижче
 */
export default function OrgPage() {
  // ----- demo state (замінити на дані API)
  const [tree, setTree] = useState(() => demoTree());
  const [positions, setPositions] = useState(() => demoPositions(tree));
  const [filters, setFilters] = useState({ q: "", divisionId: "any", departmentId: "any", role: "any" });
  const [highlightIds, setHighlightIds] = useState(new Set());
  const [expanded, setExpanded] = useState(() => loadExpanded());

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
    // TODO: PATCH /org/position/{id}
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

  return (
    <div className="page">
      <h1 className="page-title">Орг. структура</h1>
      <div className="org-layout">
        <aside className="org-left card">
          <OrgLeftPanel
            positions={filteredPositions}
            allPositions={positions}
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            onUpdatePosition={handleUpdatePosition}
          />
        </aside>

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
    </div>
  );
}

/* ----------------- helpers / demo data (замінити API) ----------------- */
function demoTree() {
  return [
    {
      id: "div1", type: "division", name: "Відділення А",
      head: { id: 101, name: "Олена Р." },
      productValue: "Планування і P&L підрозділу",
      order: 1,
      departments: [
        {
          id: "dep1", type: "department", name: "Відділ Продажів", head: { id: 102, name: "Ігор С." },
          productValue: "Нові контракти",
          order: 1,
          employees: [
            { id: "pos1", type: "position", title: "Менеджер з продажу", user: { id: 201, name: "Наталія К." }, isManager: false },
            { id: "pos2", type: "position", title: "Аккаунт-менеджер", user: { id: 202, name: "Дмитро П." }, isManager: false }
          ]
        },
        {
          id: "dep2", type: "department", name: "Маркетинг", head: { id: 103, name: "Світлана Л." },
          productValue: "Ліди і бренд",
          order: 2,
          employees: [
            { id: "pos3", type: "position", title: "Контент-маркетолог", user: { id: 203, name: "Марія Д." }, isManager: false }
          ]
        }
      ]
    }
  ];
}
function demoPositions(tree) {
  const out = [];
  tree.forEach(div => {
    div.departments.forEach(dep => {
      dep.employees.forEach(p => out.push({
        id: p.id, title: p.title, user: p.user, managers: dep.head ? [dep.head] : [],
        departmentId: dep.id, divisionId: div.id, departmentName: dep.name, divisionName: div.name
      }));
    });
  });
  return out;
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
