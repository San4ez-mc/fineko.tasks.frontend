import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
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
  const [activeNoteNode, setActiveNoteNode] = useState(null);
  const [noteText, setNoteText] = useState("");

  const autosaveTimer = useRef(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});
  const [edgePaths, setEdgePaths] = useState([]);
  const slotRefs = useRef({});
  const [laneSlots, setLaneSlots] = useState({});
  const [hoverSlot, setHoverSlot] = useState({ laneId: null, index: null });

  const [edgeFrom, setEdgeFrom] = useState(null);


  useEffect(() => {
    if (schema.lanes.length && Object.keys(laneSlots).length === 0) {
      const byLaneIds = {};
      schema.lanes.forEach((l) => (byLaneIds[l.id] = []));
      schema.nodes.forEach((n) => {
        if (!byLaneIds[n.lane_id]) byLaneIds[n.lane_id] = [];
        byLaneIds[n.lane_id].push(n.id);
      });
      const max = Math.max(1, ...Object.values(byLaneIds).map((a) => a.length));
      const slots = {};
      schema.lanes.forEach((l) => {
        const arr = byLaneIds[l.id] || [];
        slots[l.id] = Array.from({ length: max }, (_, i) => ({
          id: uid("slot"),
          nodeId: arr[i] || null,
        }));
      });
      setLaneSlots(slots);
    }
  }, [schema, laneSlots]);

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

          const fromNode = schema.nodes.find((n) => n.id === e.from);
          const toNode = schema.nodes.find((n) => n.id === e.to);
          const fromLane = fromNode?.lane_id;
          const toLane = toNode?.lane_id;
          let points;
          if (fromLane && toLane && fromLane !== toLane) {
            const midY = (from.y + to.y) / 2;
            points = [
              [from.x, from.y],
              [from.x, midY],
              [to.x, midY],
              [to.x, to.y],
            ];
          } else {
            points = [
              [from.x, from.y],
              [to.x, to.y],
            ];
          }
          return {
            ...e,
            points,
            labelX: (from.x + to.x) / 2,
            labelY: (from.y + to.y) / 2,
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
        const u = await api.get("/users?active=1");
        setUsers(Array.isArray(u.data) ? u.data : u.data?.items || []);

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
    setLaneSlots((prev) => {
      const slotCount = Object.values(prev)[0]?.length || 1;
      return {
        ...prev,
        [newLane.id]: Array.from({ length: slotCount }, () => ({ id: uid("slot"), nodeId: null })),
      };
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
      assignee_user_id: undefined,
      flags: {},
      comment: "",
    };
    setSchemaSafe((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setLaneSlots((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((lid) => {
        if (!next[lid]) next[lid] = [];
      });
      let idx;
      if (afterNodeId) {
        idx = next[laneId]?.findIndex((s) => s.nodeId === afterNodeId) + 1;
      } else {
        idx = next[laneId]?.findIndex((s) => s.nodeId == null);
        if (idx == null || idx === -1) idx = next[laneId]?.length || 0;
      }
      if (next[laneId] && idx >= next[laneId].length) {
        Object.keys(next).forEach((lid) =>
          next[lid].push({ id: uid("slot"), nodeId: null })
        );
      } else if (next[laneId] && next[laneId][idx]?.nodeId != null) {
        Object.keys(next).forEach((lid) =>
          next[lid].splice(idx, 0, { id: uid("slot"), nodeId: null })
        );
      }
      next[laneId][idx] = { id: next[laneId][idx].id || uid("slot"), nodeId: newNode.id };
      return next;
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

  const onLaneDragOver = (e, laneId) => {
    e.preventDefault();
    const refs = slotRefs.current[laneId] || [];
    const idx = refs.findIndex(
      (el) => e.clientX < el.getBoundingClientRect().left + el.offsetWidth / 2
    );
    const index = idx === -1 ? refs.length - 1 : idx;
    setHoverSlot({ laneId, index });
  };

  const onLaneDrop = (e, laneId) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData("nodeId");
    if (!nodeId) return;
    const index =
      hoverSlot.laneId === laneId
        ? hoverSlot.index
        : (laneSlots[laneId]?.length || 0);
    setLaneSlots((prev) => {
      const next = {};
      Object.keys(prev).forEach((lid) => {
        next[lid] = prev[lid].map((s) => ({ ...s }));
      });
      if (next[laneId][index] && next[laneId][index].nodeId != null) {
        Object.keys(next).forEach((lid) =>
          next[lid].splice(index, 0, { id: uid("slot"), nodeId: null })
        );
      }
      Object.keys(next).forEach((lid) =>
        next[lid].forEach((s) => {
          if (s.nodeId === nodeId) s.nodeId = null;
        })
      );
      if (!next[laneId][index]) next[laneId][index] = { id: uid("slot"), nodeId: null };
      next[laneId][index].nodeId = nodeId;
      return next;
    });
    setSchemaSafe((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, lane_id: laneId } : n)),
    }));
    setHoverSlot({ laneId: null, index: null });
  };

  // ------------------- Edges (arrows) -------------------
  const addEdge = (fromId, toId, kind = "default", label = "") => {
    if (!fromId || !toId || fromId === toId) return;
    setSchemaSafe((prev) => ({
      ...prev,
      edges: [...prev.edges, { id: uid("edge"), from: fromId, to: toId, kind, label }],
    }));
  };

  const handleEdgeHandleClick = (nodeId) => {
    if (edgeFrom && edgeFrom !== nodeId) {
      addEdge(edgeFrom, nodeId);
      setEdgeFrom(null);
    } else {
      setEdgeFrom(nodeId);
    }
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
              <polyline
                className={e.kind}

                points={e.points.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke={EDGE_COLORS[e.kind] || EDGE_COLORS.default}
                strokeWidth="1"
                markerEnd={`url(#arrow-${e.kind})`}
              />
              {e.label ? (
                <text
                  x={e.labelX}
                  y={e.labelY - 4}
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
          .map((lane) => {
            const slots = laneSlots[lane.id] || [];
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
                  onDragOver={(e) => onLaneDragOver(e, lane.id)}
                  onDrop={(e) => onLaneDrop(e, lane.id)}
                  onDragLeave={() => setHoverSlot({ laneId: null, index: null })}
                >
                  {slots.map((slot, slotIdx) => {
                    const node = schema.nodes.find((n) => n.id === slot.nodeId);
                    return (
                      <div
                        key={slot.id}
                        className={`bp-slot ${slot.nodeId ? "busy" : ""} ${
                          hoverSlot.laneId === lane.id && hoverSlot.index === slotIdx
                            ? "active"
                            : ""
                        }`}
                        ref={(el) => {
                          if (!slotRefs.current[lane.id]) slotRefs.current[lane.id] = [];
                          slotRefs.current[lane.id][slotIdx] = el;
                        }}
                      >

                        <div
                          className={`bp-edge-handle ${edgeFrom === node.id ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdgeHandleClick(node.id);
                          }}
                        />
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

                        {activeNoteNode === node.id && (
                          <NotePopover
                            value={noteText}
                            onChange={setNoteText}
                            onSave={saveNote}
                            onClose={closeNote}
                          />
                        )}
                      </div>
                    );
                  })}

                <div className="bp-add-blocks">
                    <button className="btn small" onClick={() => addNode(lane.id, "action", null)}>
                      + Додати дію
                    </button>
                    <button className="btn small ghost" onClick={() => addNode(lane.id, "if", null)}>
                      + Додати IF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

    </div>
    </Layout>
  );
}


// ---------------- Subcomponents ----------------

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

