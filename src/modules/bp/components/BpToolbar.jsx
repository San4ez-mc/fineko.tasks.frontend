import React from "react";
import "./BpToolbar.css";

export default function BpToolbar() {
    return (
        <div className="bp-toolbar">
            <div className="bp-toolbar-group">
                <button className="btn">Дія</button>
                <button className="btn">IF</button>
                <button className="btn">Розгалуження</button>
                <button className="btn">Інтеграція</button>
            </div>
            <div className="bp-toolbar-group">
                <button className="btn">Стрілка</button>
                <button className="btn">Пунктир</button>
                <button className="btn">Інтеграційна стрілка</button>
            </div>
            <div className="bp-toolbar-group">
                <button className="btn">Zoom +</button>
                <button className="btn">Zoom -</button>
                <button className="btn">Fit</button>
            </div>
        </div>
    );
}
