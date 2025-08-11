import React, { useState, useCallback, useEffect } from "react";
import Header from "./Header/Header";
import Sidebar, { RightSidebar } from "./Sidebar/Sidebar";
import Footer from "./Footer/Footer";
import "./Layout.css";

const LEFT_KEY = "layout:left";
const RIGHT_KEY = "layout:right";

export default function Layout({ children }) {
    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);

    const toggleLeft = useCallback(() => {
        setLeftOpen((prev) => {
            const next = !prev;
            localStorage.setItem(LEFT_KEY, next ? "1" : "0");
            if (next) {
                setRightOpen(false);
                localStorage.setItem(RIGHT_KEY, "0");
            }
            return next;
        });
    }, []);

    const toggleRight = useCallback(() => {
        setRightOpen((prev) => {
            const next = !prev;
            localStorage.setItem(RIGHT_KEY, next ? "1" : "0");
            if (next) {
                setLeftOpen(false);
                localStorage.setItem(LEFT_KEY, "0");
            }
            return next;
        });
    }, []);

    useEffect(() => {
        const left = localStorage.getItem(LEFT_KEY) === "1";
        const right = localStorage.getItem(RIGHT_KEY) === "1";
        if (left) {
            setLeftOpen(true);
            setRightOpen(false);
        } else if (right) {
            setRightOpen(true);
        }
    }, []);

    useEffect(() => {
        const onLeft = () => toggleLeft();
        const onRight = () => toggleRight();
        window.addEventListener("ui:toggleLeftSidebar", onLeft);
        window.addEventListener("ui:toggleRightSidebar", onRight);
        return () => {
            window.removeEventListener("ui:toggleLeftSidebar", onLeft);
            window.removeEventListener("ui:toggleRightSidebar", onRight);
        };
    }, [toggleLeft, toggleRight]);

    return (
        <div className={`layout ${leftOpen ? "left-open" : ""} ${rightOpen ? "right-open" : ""}`}>
            <Sidebar
                isOpen={leftOpen}
                onToggle={toggleLeft}
                resultsCount={3}
                telegramCount={2}
            />
            <div className="layout-column">
                <Header />
                <main className="layout-content">{children}</main>
                <Footer />
            </div>
            <RightSidebar />
            <button
                className="sidebar-handle left-handle"
                aria-label="Toggle left sidebar"
                onClick={toggleLeft}
            />
            <button
                className="sidebar-handle right-handle"
                aria-label="Toggle right sidebar"
                onClick={toggleRight}
            />
        </div>
    );
}
