import React, { useState } from "react";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import Footer from "./Footer/Footer";
import "./Layout.css";

export default function Layout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className={`layout ${menuOpen ? "" : "collapsed-sidebar"}`}>
            <Sidebar isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
            <div className="layout-column">
                <Header />
                <main className="layout-content">{children}</main>
                <Footer />
            </div>
        </div>
    );
}
