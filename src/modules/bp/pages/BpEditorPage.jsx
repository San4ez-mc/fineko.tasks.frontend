import React from "react";
import { useParams } from "react-router-dom";
import BpToolbar from "../components/BpToolbar";
import BpCanvas from "../components/BpCanvas";
import BpInspector from "../components/BpInspector";
import "./BpEditorPage.css";

export default function BpEditorPage() {
    const { id } = useParams();

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
