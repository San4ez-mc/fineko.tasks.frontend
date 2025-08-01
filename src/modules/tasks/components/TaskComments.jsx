import React, { useState } from "react";

export default function TaskComments({ comments, onAddComment }) {
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState(null); // ID або індекс коментаря, на який відповідаємо
    const [replyText, setReplyText] = useState("");

    // Додаємо головний коментар
    const handleAddMainComment = () => {
        if (!newComment.trim()) return;
        onAddComment({ text: newComment, parentId: null });
        setNewComment("");
    };

    // Додаємо підкоментар
    const handleAddReply = (parentId) => {
        if (!replyText.trim()) return;
        onAddComment({ text: replyText, parentId });
        setReplyText("");
        setReplyTo(null); // закриваємо форму відповіді
    };

    return (
        <div className="task-comments">
            <h4>Коментарі:</h4>

            {/* Список коментарів */}
            {comments.length === 0 && <p>Поки немає коментарів</p>}
            {comments.map((c, idx) => (
                <div key={idx} className="comment-item">
                    <b>{c.author}:</b> {c.text}

                    {/* Якщо є підкоментарі */}
                    {c.replies && c.replies.length > 0 && (
                        <div className="comment-replies">
                            {c.replies.map((r, ridx) => (
                                <div key={ridx} className="comment-reply">
                                    <b>{r.author}:</b> {r.text}
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
                            <button onClick={() => handleAddReply(idx)}>Додати відповідь</button>
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
