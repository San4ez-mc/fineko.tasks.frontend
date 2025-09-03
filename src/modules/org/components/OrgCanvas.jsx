import React, { useMemo, useRef, useState } from "react";
import OrgNode from "./OrgNode";

/**
 * props:
 * - tree: [{ division }]
 * - expanded: Set<string>
 * - onToggleExpand(key)
 * - highlightIds: Set<string>
 * - onUpdateUnit(id, patch)
 * - onMove({ entity:'department'|'position', id, targetId })
 * - onReplaceUser(positionId, newUser)
 */
export default function OrgCanvas({
  tree, expanded, onToggleExpand, highlightIds,
  onUpdateUnit, onMove, onReplaceUser,
  canEdit = false
}) {
  const viewportRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);

  const onWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.min(2, Math.max(0.5, z * factor)));
    }
  };

  const startPan = (e) => { setDragging({ x: e.clientX, y: e.clientY, orig: offset }); };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: dragging.orig.x + (e.clientX - dragging.x), y: dragging.orig.y + (e.clientY - dragging.y) });
  };
  const endPan = () => setDragging(null);

  const resetView = () => { setZoom(1); setOffset({x:0,y:0}); };

  return (
    <div className="org-canvas-viewport" ref={viewportRef} onWheel={onWheel} onMouseMove={onMouseMove} onMouseUp={endPan} onMouseLeave={endPan}>
      <div className="org-canvas-controls">
        <button className="btn ghost" onClick={()=>setZoom(z=>Math.min(2, z+0.1))}>+</button>
        <button className="btn ghost" onClick={()=>setZoom(z=>Math.max(0.5, z-0.1))}>−</button>
        <button className="btn ghost" onClick={resetView}>Reset view</button>
      </div>

      <div
        className="org-canvas-inner"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
        onMouseDown={startPan}
      >
        {tree.map((div) => (
          <div key={div.id} className="org-column">
            <OrgNode
              node={div}
              level={0}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              highlightIds={highlightIds}
              onUpdateUnit={onUpdateUnit}
              onMove={onMove}
              onReplaceUser={onReplaceUser}
              canEdit={canEdit}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
