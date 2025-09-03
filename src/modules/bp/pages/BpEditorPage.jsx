import React from "react";
import BpToolbar from "../components/BpToolbar";
import BpCanvas from "../components/BpCanvas";
import BpInspector from "../components/BpInspector";
import "./BpEditorPage.css";

export default function BpEditorPage() {
    return (
        <div className="bp-editor-page">
            <BpToolbar />
            <div className="bp-editor-main">
                <BpCanvas />
                <BpInspector />
            </div>
        </div>
    );
}
