import React, { useState } from "react";
import "./BpCanvas.css";

export default function BpCanvas() {
    const [lanes, setLanes] = useState([]);

    const addLane = () => {
        const id = crypto.randomUUID();
        setLanes([...lanes, { id, title: "" }]);
    };

    const updateLaneTitle = (id, title) => {
        setLanes(lanes.map((l) => (l.id === id ? { ...l, title } : l)));
    };

    return (
        <div className="bp-canvas">
            {lanes.map((lane) => (
                <div key={lane.id} className="bp-lane">
                    <input
                        className="bp-lane-title"
                        value={lane.title}
                        placeholder="Назва посади"
                        onChange={(e) => updateLaneTitle(lane.id, e.target.value)}
                    />
                </div>
            ))}
            <button className="bp-add-lane" onClick={addLane}>
                + Додати свімлейн
            </button>
        </div>
    );
}
