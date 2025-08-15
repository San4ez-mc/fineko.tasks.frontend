import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import api from "../../../services/api";
import "./BusinessProcessEditPage.css";

const EDGE_COLORS = {
  default: "#9ca3af",
  new: "#16a34a",
  outdated: "#7c3aed",
  problem: "#dc2626",
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function BusinessProcessEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = !id || id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(isNew ? "Новий бізнес‑процес" : "");
  const [schema, setSchema] = useState({ lanes: [], nodes: [], edges: [] });

  const [users, setUsers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [activeNoteNode, setActiveNoteNode] = useState(null);
  const [noteText, setNoteText] = useState("");

  const autosaveTimer = useRef(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});
  const [edgePaths, setEdgePaths] = useState([]);

  const schemaByLane = useMemo(() => {
    const byLane = {};
    schema.lanes
      .slice()
      .sort((a, b) => a.order - b.order)
      .forEach((l) => (byLane[l.id] = []));
    schema.nodes.forEach((n) => {
      if (!byLane[n.lane_id]) byLane[n.lane_id] = [];
      byLane[n.lane_id].push(n);
    });
    // порядок у межах лейну = порядок у масиві nodes, тому відсортуємо за індексом схемно
    Object.keys(byLane).forEach((laneId) => {
      byLane[laneId].sort(
        (a, b) =>
          schema.nodes.findIndex((n) => n.id === a.id) -
          schema.nodes.findIndex((n) => n.id === b.id)
      );
    });
    return byLane;
  }, [schema]);

  useLayoutEffect(() => {
    const update = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const rects = {};
      Object.keys(nodeRefs.current).forEach((id) => {
        const el = nodeRefs.current[id];
        if (el) {
          const r = el.getBoundingClientRect();
          rects[id] = {
            x: r.left + r.width / 2 - canvasRect.left,
            y: r.top + r.height / 2 - canvasRect.top,
          };
        }
      });
      const paths = (schema.edges || [])
        .map((e) => {
          const from = rects[e.from];
          const to = rects[e.to];
          if (!from || !to) return null;
          return {
            ...e,
            x1: from.x,
            y1: from.y,
            x2: to.x,
            y2: to.y,
          };
        })
        .filter(Boolean);
      setEdgePaths(paths);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [schema]);

  // -------- Helpers to mark dirty & schedule autosave --------
  const markDirty = () => {
    setDirty(true);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      void saveProcess();
    }, 2000); // debounce 2s
  };

  const setSchemaSafe = (updater) => {
    setSchema((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
    markDirty();
  };

  // ------------------- API load -------------------
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [u, p] = await Promise.all([
          api.get("/users?active=1"),
          api.get("/positions"),
        ]);
        setUsers(Array.isArray(u.data) ? u.data : u.data?.items || []);
        setPositions(Array.isArray(p.data) ? p.data : p.data?.items || []);

        if (!isNew) {
          const { data } = await api.get(`/business-processes/${id}`);
          setName(data?.name || "");
          setSchema(
            data?.schema && typeof data.schema === "object"
              ? data.schema
              : { lanes: [], nodes: [], edges: [] }
          );
        } else {
          // створюємо порожню стартову схему з одним свімлейном
          const laneId = uid("lane");
          setSchema({
            lanes: [{ id: laneId, title: "Нова посада", order: 1 }],
            nodes: [],
            edges: [],
          });
        }
      } catch (e) {
        setError(e?.response?.data?.message || "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    };
    void load();
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ------------------- Save / autosave -------------------
  const saveProcess = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        const { data } = await api.post("/business-processes", {
          name,
          schema,
        });
        setDirty(false);
        // редірект на /:id/edit
        navigate(`/business-processes/${data.id}/edit`, { replace: true });
      } else {
        await api.patch(`/business-processes/${id}`, { name, schema });
        setDirty(false);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  // ------------------- Lanes (swimlanes) -------------------
  const addLaneAfter = async (afterLaneId = null) => {
    // варіант: одразу показати інпут назви; позиції (довідник) — окремо
    const newLane = {
      id: uid("lane"),
      title: "Нова посада",
      order:
        (schema.lanes.find((l) => l.id === afterLaneId)?.order || 0) + 0.5,
    };
    setSchemaSafe((prev) => {
      const lanes = [...prev.lanes, newLane].map((l) => ({ ...l }));
      // нормалізуємо order: 1,2,3...
      lanes
        .sort((a, b) => a.order - b.order)
        .forEach((l, idx) => (l.order = idx + 1));
      return { ...prev, lanes };
    });
  };

  const updateLaneTitle = (laneId, title) => {
    setSchemaSafe((prev) => ({
      ...prev,
      lanes: prev.lanes.map((l) => (l.id === laneId ? { ...l, title } : l)),
    }));
  };

  const onLaneDragStart = (e, laneId) => {
    e.dataTransfer.setData("laneId", laneId);
  };

  const onLaneDropAfter = (e, afterLaneId) => {
    const laneId = e.dataTransfer.getData("laneId");
    if (!laneId || laneId === afterLaneId) return;
    setSchemaSafe((prev) => {
      const lanes = prev.lanes.slice();
      const moving = lanes.find((l) => l.id === laneId);
      if (!moving) return prev;
      const after = lanes.find((l) => l.id === afterLaneId);
      moving.order = (after?.order || 0) + 0.5;
      lanes
        .sort((a, b) => a.order - b.order)
        .forEach((l, i) => (l.order = i + 1));
      return { ...prev, lanes };
    });
  };

  // ------------------- Nodes (blocks) -------------------
  const addNode = (laneId, type = "action", afterNodeId = null) => {
    const newNode = {
      id: uid(type === "if" ? "if" : "node"),
      type,
      lane_id: laneId,
      title: type === "if" ? "IF" : "Нова дія",
      assignee_user_id: undefined, // задається окремо
      flags: {},
      comment: "",
    };
    setSchemaSafe((prev) => {
      const nodes = prev.nodes.slice();
      if (!afterNodeId) {
        // в кінець lane
        const lastIndex = nodes
          .map((n, idx) => ({ n, idx }))
          .filter((x) => x.n.lane_id === laneId)
          .map((x) => x.idx)
          .pop();
        if (lastIndex == null) nodes.push(newNode);
        else nodes.splice(lastIndex + 1, 0, newNode);
      } else {
        const idx = nodes.findIndex((n) => n.id === afterNodeId);
        if (idx >= 0) nodes.splice(idx + 1, 0, newNode);
        else nodes.push(newNode);
      }
      return { ...prev, nodes };
    });
  };

  const updateNode = (nodeId, patch) => {
    setSchemaSafe((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)),
    }));
  };

  const toggleFlag = (nodeId, flag) => {
    setSchemaSafe((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const flags = { ...(n.flags || {}) };
        if (flag === "isNew") {
          // взаємовиключно з isOutdated
          flags.isNew = !flags.isNew;
          if (flags.isNew) flags.isOutdated = false;
        } else if (flag === "isOutdated") {
          flags.isOutdated = !flags.isOutdated;
          if (flags.isOutdated) flags.isNew = false;
        } else if (flag === "isProblem") {
          flags.isProblem = !flags.isProblem;
        }
        return { ...n, flags };
      }),
    }));
  };

  const onNodeDragStart = (e, nodeId) => {
    e.dataTransfer.setData("nodeId", nodeId);
  };

  const onNodeDropAfter = (e, laneId, afterNodeId = null) => {
    const nodeId = e.dataTransfer.getData("nodeId");
    if (!nodeId) return;
    setSchemaSafe((prev) => {
      const nodes = prev.nodes.slice();
      const idx = nodes.findIndex((n) => n.id === nodeId);
      if (idx < 0) return prev;
      const moving = nodes[idx];
      // вилучаємо
      nodes.splice(idx, 1);
      moving.lane_id = laneId;
      if (!afterNodeId) {
        // в кінець lane
        let lastIndex = -1;
        nodes.forEach((n, i) => {
          if (n.lane_id === laneId) lastIndex = i;
        });
        if (lastIndex === -1) nodes.push(moving);
        else nodes.splice(lastIndex + 1, 0, moving);
      } else {
        const insertAfter = nodes.findIndex((n) => n.id === afterNodeId);
        nodes.splice(insertAfter + 1, 0, moving);
      }
      return { ...prev, nodes };
    });
  };

  // ------------------- Edges (arrows) -------------------
  const addEdge = (fromId, toId, kind = "default", label = "") => {
    if (!fromId || !toId || fromId === toId) return;
    setSchemaSafe((prev) => ({
      ...prev,
      edges: [...prev.edges, { id: uid("edge"), from: fromId, to: toId, kind, label }],
    }));
  };

  const removeEdge = (edgeId) => {
    setSchemaSafe((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== edgeId),
    }));
  };

  // ------------------- Notes & Tasks -------------------
  const openNote = (node) => {
    setActiveNoteNode(node.id);
    setNoteText(node.comment || "");
  };

  const closeNote = () => {
    setActiveNoteNode(null);
    setNoteText("");
  };

  const saveNote = () => {
    if (!activeNoteNode) return;
    updateNode(activeNoteNode, { comment: noteText });
    closeNote();
  };

  const createTaskFromNode = async (node) => {
    try {
      await api.post("/tasks", {
        title: node.title || "Задача з процесу",
        assignee_id: node.assignee_user_id || null,
        source: "process",
        process_id: isNew ? null : Number(id),
        node_id: node.id,
      });
      // показати тост успіху
    } catch (e) {
      // показати тост помилки
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="bp-edit-page">
          <Breadcrumbs
            items={[
              { label: "Бізнес процеси", to: "/business-processes" },
              { label: isNew ? "Новий бізнес‑процес" : name },
            ]}
          />
          <div className="loader">Завантаження…</div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="bp-edit-page">
        <Breadcrumbs
          items={[
            { label: "Бізнес процеси", to: "/business-processes" },
            { label: isNew ? "Новий бізнес‑процес" : name },
          ]}
        />
        <div className="bp-header">
          <div className="bp-title">
            <span>Бізнес процес — </span>
            <input
              className="bp-name-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              markDirty();
            }}
          />
        </div>
        <div className="bp-actions">
          <span className={`save-indicator ${dirty ? "dirty" : "saved"}`}>
            {dirty ? "● Є незбережені зміни" : "● Збережено"}
          </span>
          <button className="btn ghost" onClick={() => window.history.back()}>
            Назад
          </button>
          <button className="btn" onClick={() => saveProcess()} disabled={saving}>
            {saving ? "Збереження…" : "Зберегти зараз"}
          </button>
        </div>
      </div>

      {error && <div className="bp-error">{error}</div>}

      <div className="bp-canvas" ref={canvasRef}>
        <svg className="bp-edges-svg">
          <defs>
            {Object.entries(EDGE_COLORS).map(([k, color]) => (
              <marker
                key={k}
                id={`arrow-${k}`}
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill={color} />
              </marker>
            ))}
          </defs>
          {edgePaths.map((e) => (
            <g key={e.id} className={`edge ${e.kind}`}>
              <line
                className={e.kind}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke={EDGE_COLORS[e.kind] || EDGE_COLORS.default}
                strokeWidth="2"
                markerEnd={`url(#arrow-${e.kind})`}
              />
              {e.label ? (
                <text
                  x={(e.x1 + e.x2) / 2}
                  y={(e.y1 + e.y2) / 2 - 4}
                  textAnchor="middle"
                  fontSize="12"
                  fill={EDGE_COLORS[e.kind] || EDGE_COLORS.default}
                >
                  {e.label}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
        {/* кнопка додати лейн зверху */}
        <button className="btn small ghost add-lane-top" onClick={() => addLaneAfter(null)}>+ Додати посаду зверху</button>

        {schema.lanes
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((lane, laneIdx) => {
            const laneNodes = schemaByLane[lane.id] || [];
            return (
              <div
                className="bp-lane"
                key={lane.id}
                draggable
                onDragStart={(e) => onLaneDragStart(e, lane.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onLaneDropAfter(e, lane.id)}
              >
                <div className="bp-lane-header">
                  <input
                    className="bp-lane-title"
                    value={lane.title}
                    onChange={(e) => updateLaneTitle(lane.id, e.target.value)}
                  />
                  <button className="btn tiny ghost" onClick={() => addLaneAfter(lane.id)}>
                    + Додати посаду нижче
                  </button>
                </div>

                <div
                  className="bp-lane-body"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onNodeDropAfter(e, lane.id, null)}
                >
                  {laneNodes.map((node, idx) => (
                    <div className="bp-node-wrap" key={node.id}>
                      <div
                        className={`bp-node ${node.type === "if" ? "if" : "action"} \
                          ${node.flags?.isNew ? "flag-new" : ""} \
                          ${node.flags?.isOutdated ? "flag-outdated" : ""} \
                          ${node.flags?.isProblem ? "flag-problem" : ""}`}
                        ref={(el) => (nodeRefs.current[node.id] = el)}
                        draggable
                        onDragStart={(e) => onNodeDragStart(e, node.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onNodeDropAfter(e, lane.id, node.id)}
                        title="Перетягніть для зміни порядку або lane"
                      >
                        <div className="bp-node-top">
                          <input
                            className="bp-node-title"
                            value={node.title}
                            onChange={(e) =>
                              updateNode(node.id, { title: e.target.value })
                            }
                          />
                          <div className="bp-node-flags">
                            <button
                              className={`icon new ${node.flags?.isNew ? "on" : ""}`}
                              title="Позначити як Новий (зел.)"
                              onClick={() => toggleFlag(node.id, "isNew")}
                            />
                            <button
                              className={`icon outdated ${node.flags?.isOutdated ? "on" : ""}`}
                              title="Позначити як Застарілий (фіол.)"
                              onClick={() => toggleFlag(node.id, "isOutdated")}
                            />
                            <button
                              className={`icon problem ${node.flags?.isProblem ? "on" : ""}`}
                              title="Позначити як Проблемний (черв.)"
                              onClick={() => toggleFlag(node.id, "isProblem")}
                            />
                          </div>
                        </div>

                        <div className="bp-node-bottom">
                          <select
                            className="bp-node-assignee"
                            value={node.assignee_user_id || ""}
                            onChange={(e) =>
                              updateNode(node.id, {
                                assignee_user_id: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                          >
                            <option value="">Виконавець (користувач)</option>
                            {users.map((u) => {
                              const label =
                                [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                                u.username ||
                                `ID ${u.id}`;
                              return (
                                <option key={u.id} value={u.id}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>

                          <div className="bp-node-actions">
                            <button
                              className="btn tiny ghost"
                              onClick={() => addNode(lane.id, "action", node.id)}
                            >
                              + Дію між
                            </button>
                            <button
                              className="btn tiny ghost"
                              onClick={() => addNode(lane.id, "if", node.id)}
                            >
                              + IF між
                            </button>
                            <button
                              className="btn tiny"
                              onClick={() => openNote(node)}
                              title="Нотатка"
                            >
                              Коментувати
                            </button>
                            <button
                              className="btn tiny ghost"
                              onClick={() => createTaskFromNode(node)}
                              title="Створити задачу з цієї дії"
                            >
                              Ств. задачу
                            </button>
                          </div>
                        </div>

                        {/* Поповер з нотаткою */}
                        {activeNoteNode === node.id && (
                          <NotePopover
                            value={noteText}
                            onChange={setNoteText}
                            onSave={saveNote}
                            onClose={closeNote}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {Array.from({ length: 10 }).map((_, idx) => (
                    <AddSlot
                      key={`slot-${idx}`}
                      laneId={lane.id}
                      addNode={addNode}
                      onNodeDropAfter={onNodeDropAfter}
                    />
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* Панель простого додавання зв’язків (edges) */}
      <EdgesPanel schema={schema} onAdd={addEdge} onRemove={removeEdge} />
    </div>
    </Layout>
  );
}

// ---------------- Subcomponents ----------------

function AddSlot({ laneId, addNode, onNodeDropAfter }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (type) => {
    addNode(laneId, type, null);
    setOpen(false);
  };

  return (
    <div
      className="bp-slot"
      ref={ref}
      onClick={() => setOpen(true)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onNodeDropAfter(e, laneId, null)}
    >
      <span className="bp-slot-plus">+</span>
      {open && (
        <div className="bp-slot-popup" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn tiny"
            onClick={(e) => {
              e.stopPropagation();
              handleAdd("action");
            }}
          >
            Створити дію
          </button>
          <button
            className="btn tiny ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleAdd("if");
            }}
          >
            Створити розгалуження (if)
          </button>
        </div>
      )}
    </div>
  );
}

function EdgesPanel({ schema, onAdd, onRemove }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kind, setKind] = useState("default");
  const [label, setLabel] = useState("");

  const nodes = schema.nodes;

  return (
    <div className="edges-panel">
      <div className="edges-row">
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          <option value="">Звідки</option>
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)}>
          <option value="">Куди</option>
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="default">Звичайна</option>
          <option value="new">Нова (зел.)</option>
          <option value="outdated">Застаріла (фіол.)</option>
          <option value="problem">Проблемна (черв.)</option>
        </select>
        <input
          type="text"
          placeholder="Мітка (для IF)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button
          className="btn small"
          onClick={() => {
            onAdd(from, to, kind, label.trim());
            setFrom(""); setTo(""); setKind("default"); setLabel("");
          }}
        >
          + Додати стрілку
        </button>
      </div>

      {schema.edges?.length ? (
        <div className="edges-list">
          {schema.edges.map((e) => (
            <div key={e.id} className={`edge-item ${e.kind}`}>
              <span>{e.label ? `${e.label}: ` : ""}{e.from} → {e.to}</span>
              <button className="btn tiny ghost" onClick={() => onRemove(e.id)}>Видалити</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NotePopover({ value, onChange, onSave, onClose }) {
  return (
    <div className="comments-popover" role="dialog">
      <div className="cp-header">
        <div>Нотатка</div>
        <button className="btn tiny ghost" onClick={onClose}>×</button>
      </div>
      <div className="cp-body">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="cp-footer">
        <button className="btn small" onClick={onSave}>
          Зберегти
        </button>
      </div>
    </div>
  );
}

