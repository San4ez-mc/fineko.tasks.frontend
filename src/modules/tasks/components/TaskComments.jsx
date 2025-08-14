import React, { useState } from "react";
import api from "../../../services/api";
import "./TaskComments.css";

export default function TaskComments({
    taskId,
    author = "Я",
    comments = [],
    onCommentsChange,
}) {
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState(null); // ID або індекс коментаря, на який відповідаємо
    const [replyText, setReplyText] = useState("");

    // Додаємо головний коментар
    const handleAddMainComment = async () => {
        if (!newComment.trim()) return;
        const updated = [...comments, { author, text: newComment, replies: [] }];
        try {
            await api.patch(`/task/update-field?id=${taskId}`, {
                field: "comments",
                value: JSON.stringify(updated),
            });
            onCommentsChange?.(updated);
            setNewComment("");
        } catch (e) {
            console.error("Помилка додавання коментаря:", e);
        }
    };

    // Додаємо підкоментар
    const handleAddReply = async (parentId) => {
        if (!replyText.trim()) return;
        const updated = [...comments];
        if (updated[parentId]) {
            const replies = updated[parentId].replies || [];
            updated[parentId] = {
                ...updated[parentId],
                replies: [...replies, { author, text: replyText }],
            };
        }
        try {
            await api.patch(`/task/update-field?id=${taskId}`, {
                field: "comments",
                value: JSON.stringify(updated),
            });
            onCommentsChange?.(updated);
            setReplyText("");
            setReplyTo(null); // закриваємо форму відповіді
        } catch (e) {
            console.error("Помилка додавання коментаря:", e);
        }
    };

    return (
        <div className="task-comments">
            <h4>Коментарі:</h4>

            {/* Список коментарів */}
            {comments.length === 0 && <p>Поки немає коментарів</p>}
            {comments.map((c, idx) => (
                <div key={idx} className="comment-item">
                    <div className="comment-author">{c.author}</div>
                    <div className="comment-text">{c.text}</div>

                    {/* Якщо є підкоментарі */}
                    {c.replies && c.replies.length > 0 && (
                        <div className="comment-replies">
                            {c.replies.map((r, ridx) => (
                                <div key={ridx} className="comment-reply">
                                    <div className="comment-author">{r.author}</div>
                                    <div className="comment-text">{r.text}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Кнопка відповіді */}
                    <button
                        className="reply-btn"
                        onClick={() => setReplyTo(replyTo === idx ? null : idx)}
                    >
                        {replyTo === idx ? "Скасувати" : "Відповісти"}
                    </button>

                    {/* Якщо активна відповідь для цього коментаря */}
                    {replyTo === idx && (
                        <div className="reply-form">
                            <input
                                type="text"
                                placeholder="Написати відповідь..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button onClick={() => handleAddReply(idx)}>
                                Додати відповідь
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Додавання нового головного коментаря */}
            <div className="add-comment">
                <input
                    type="text"
                    placeholder="Написати новий коментар..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={handleAddMainComment}>Додати</button>
            </div>
        </div>
    );
}
