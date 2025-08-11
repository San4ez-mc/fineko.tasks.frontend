import React, { useState } from "react";
import Header from "./Header/Header";
import Sidebar, { RightSidebar } from "./Sidebar/Sidebar";
import Footer from "./Footer/Footer";
import "./Layout.css";

export default function Layout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className={`layout ${menuOpen ? "" : "collapsed-sidebar"}`}>
            <Sidebar
                isOpen={menuOpen}
                onToggle={() => setMenuOpen(!menuOpen)}
                resultsCount={3}
                telegramCount={2}
            />
            <div className="layout-column">
                <Header onToggleMenu={() => setMenuOpen(!menuOpen)} />
                <main className="layout-content">{children}</main>
                <Footer />
            </div>
            <RightSidebar />
        </div>
    );
}
