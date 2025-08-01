import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

export default function OrgStructurePage() {
    const [tree, setTree] = useState([]);

    useEffect(() => {
        async function load() {
            try {
                const [posRes, userRes] = await Promise.all([
                    axios.get(
                        `${API_BASE_URL}/position`
                    ),
                    axios.get(
                        `${API_BASE_URL}/user`
                    ),
                ]);
                const positions = posRes.data;
                const users = userRes.data;
                const map = {};
                positions.forEach((p) => {
                    map[p.id] = { ...p, users: [], children: [] };
                });
                users.forEach((u) => {
                    (u.positions || []).forEach((pos) => {
                        if (map[pos.id]) map[pos.id].users.push(u);
                    });
                });
                const roots = [];
                positions.forEach((p) => {
                    const node = map[p.id];
                    if (p.manager_id && map[p.manager_id]) {
                        map[p.manager_id].children.push(node);
                    } else {
                        roots.push(node);
                    }
                });
                setTree(roots);
            } catch (e) {
                console.error("Failed to load org structure", e);
            }
        }
        load();
    }, []);

    const renderNode = (node) => (
        <li key={node.id}>
            <strong>{node.name}</strong>
            {node.users.map((u) => (
                <div key={u.id}>{u.username}</div>
            ))}
            {node.children.length > 0 && <ul>{node.children.map(renderNode)}</ul>}
        </li>
    );

    return (
        <Layout>
            <h2>Організаційна структура</h2>
            <ul>{tree.map(renderNode)}</ul>
        </Layout>
    );
}
