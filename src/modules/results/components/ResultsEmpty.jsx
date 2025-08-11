import React from "react";
import "./ResultsEmpty.css";

export default function ResultsEmpty({ onCreate }) {
  return (
    <div className="results-empty card">
      <h3>Результатів не знайдено</h3>
      <p>Спробуйте змінити фільтри або додайте перший результат.</p>
      <button className="btn primary" onClick={onCreate}>Додати результат</button>
    </div>
  );
}
