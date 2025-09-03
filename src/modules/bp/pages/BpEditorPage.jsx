import React from "react";
import Layout from "../../../components/layout/Layout";
import BpToolbar from "../components/BpToolbar";
import BpCanvas from "../components/BpCanvas";
import BpInspector from "../components/BpInspector";
import "./BpEditorPage.css";

export default function BpEditorPage() {
    return (
        <Layout>
            <div className="bp-editor-page">
                <BpToolbar />
                <div className="bp-editor-main">
                    <BpCanvas />
                    <BpInspector />
                </div>
            </div>
        </Layout>
    );
}
