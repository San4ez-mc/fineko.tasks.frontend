import React from "react";

export default function GroupList({ groups = [] }) {
    if (!groups.length) {
        return <p>Груп немає</p>;
    }

    return (
        <ul>
            {groups.map((g) => (
                <li key={g.id || g.link || g.username}>
                    {g.title || g.name || g.username || g.id}
                </li>
            ))}
        </ul>
    );
}
