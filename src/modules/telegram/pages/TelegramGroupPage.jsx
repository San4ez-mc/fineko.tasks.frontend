import React from "react";
import Layout from "../../../components/layout/Layout";
import { Link } from "react-router-dom";
import "./TelegramGroupPage.css";

export default function TelegramGroupPage() {
    return (
        <Layout>
            <div className="telegram-page">
                <h2>Telegram</h2>
                <section>
                    <ul>
                        <li>
                            <Link to="/telegram/link">Прив'язка за кодом</Link>
                        </li>
                        <li>
                            <Link to="/telegram/groups">Групи</Link>
                        </li>
                        <li>
                            <Link to="/telegram/users">Користувачі</Link>
                        </li>
                    </ul>
                </section>
            </div>
        </Layout>
    );
}
