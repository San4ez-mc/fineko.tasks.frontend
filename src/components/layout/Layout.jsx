import React, { useState, useEffect, useCallback } from "react";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import Footer from "./Footer/Footer";
import "./Layout.css";

export default function Layout({ children }) {
    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);

    /* restore state */
    useEffect(() => {
        const left = localStorage.getItem("layout-left-open") === "1";
        const right = localStorage.getItem("layout-right-open") === "1";
        if (left && right) {
            setLeftOpen(true);
            setRightOpen(false);
        } else {
            setLeftOpen(left);
            setRightOpen(right);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("layout-left-open", leftOpen ? "1" : "0");
    }, [leftOpen]);

    useEffect(() => {
        localStorage.setItem("layout-right-open", rightOpen ? "1" : "0");
    }, [rightOpen]);

    const toggleLeft = useCallback(() => {
        setLeftOpen((prev) => {
            const next = !prev;
            if (next) setRightOpen(false);
            return next;
        });
    }, []);

    const toggleRight = useCallback(() => {
        setRightOpen((prev) => {
            const next = !prev;
            if (next) setLeftOpen(false);
            return next;
        });
    }, []);

    /* custom event listeners */
    useEffect(() => {
        const handleLeft = () => toggleLeft();
        const handleRight = () => toggleRight();
        window.addEventListener("ui:toggleLeftSidebar", handleLeft);
        window.addEventListener("ui:toggleRightSidebar", handleRight);
        return () => {
            window.removeEventListener("ui:toggleLeftSidebar", handleLeft);
            window.removeEventListener("ui:toggleRightSidebar", handleRight);
        };
    }, [toggleLeft, toggleRight]);

    return (
        <div
            className={`layout ${leftOpen ? "left-open" : ""} ${rightOpen ? "right-open" : ""}`}
            style={{ "--left-open": leftOpen ? 1 : 0, "--right-open": rightOpen ? 1 : 0 }}
        >
            <Sidebar position="left" isOpen={leftOpen} onToggle={toggleLeft} />
            <Sidebar position="right" isOpen={rightOpen} onToggle={toggleRight} />
            <button
                className="sidebar-handle sidebar-handle-left"
                aria-label="Toggle left sidebar"
                onClick={toggleLeft}
            />
            <button
                className="sidebar-handle sidebar-handle-right"
                aria-label="Toggle right sidebar"
                onClick={toggleRight}
            />
            <div className="layout-column">
                <Header onToggleMenu={toggleLeft} />
                <main className="layout-content">{children}</main>
                <Footer />
            </div>
        </div>
    );
}

