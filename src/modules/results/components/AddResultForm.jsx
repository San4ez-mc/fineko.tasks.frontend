import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import './AddResultForm.css';

export default function AddResultForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    final_result: '',
    date: '',
    due_date: '',
    urgent: false,
    description: '',
    responsible_id: ''
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [dueDateValid, setDueDateValid] = useState(true);
  const [dateValid, setDateValid] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const r = await api.get('/users', { params: { active: 1 } });
        setUsers(r.data || []);
      } catch {
        // ignore
      }
    };
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (name === 'due_date') {
      const re = /^\d{2}:\d{2}$/;
      setDueDateValid(re.test(val) || val === '');
    }
    if (name === 'date') {
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setDateValid(selected >= today || val === '');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (form.date) {
        const selected = new Date(form.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
          setDateValid(false);
          return;
        }
      }

      const payload = {
        title: form.title,
        final_result: form.final_result,
        date: form.date,
        due_date: form.due_date,
        urgent: form.urgent,
        description: form.description,
        responsible_id: Number(form.responsible_id)
      };
      await api.post('/results', payload);
      onSaved && onSaved();
      setForm({ title: '', final_result: '', date: '', due_date: '', urgent: false, description: '', responsible_id: '' });
      setDueDateValid(true);
      setDateValid(true);
    } catch (e) {
      const msg = e.response?.data?.message || 'Не вдалося створити результат';
      setError(msg);
    }
  };

  const labelForUser = (u) => {
    if (u.first_name || u.last_name) {
      return `${u.first_name || ''} ${u.last_name || ''}`.trim();
    }
    return u.username || `ID ${u.id}`;
  };

  return (
    <div className="add-result-form card">
      <form onSubmit={handleSubmit}>
        <label className="arf-field">
          <span>Назва*</span>
          <input
            type="text"
            name="title"
            className="input"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <div className="arf-row">
          <label className="arf-field">
            <span>Кінцевий результат*</span>
            <input
              type="text"
              name="final_result"
              className="input"
              value={form.final_result}
              onChange={handleChange}
              required
            />
          </label>
          <label className="arf-field">
            <span>Дата</span>
            <input
              type="date"
              name="date"
              className={`input${!dateValid && form.date ? ' invalid' : ''}`}
              value={form.date}
              min={todayStr}
              onChange={handleChange}
            />
            {!dateValid && form.date && (
              <span className="arf-hint">Дата не може бути в минулому</span>
            )}
          </label>
          <label className="arf-field arf-due">
            <span>Кінцевий термін</span>
            <input
              type="text"
              name="due_date"
              className={`input${!dueDateValid && form.due_date ? ' invalid' : ''}`}
              placeholder="гг:хх"
              value={form.due_date}
              onChange={handleChange}
            />
            {!dueDateValid && form.due_date && (
              <span className="arf-hint">Формат: гг:хх</span>
            )}
          </label>
          <label className="arf-check">
            <input
              type="checkbox"
              name="urgent"
              checked={form.urgent}
              onChange={handleChange}
            />
            <span>Терміново</span>
          </label>
        </div>

        <label className="arf-field">
          <span>Опис</span>
          <textarea
            name="description"
            className="input"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label className="arf-field">
          <span>Відповідальний*</span>
          <select
            name="responsible_id"
            className="input"
            value={form.responsible_id}
            onChange={handleChange}
            required
          >
            <option value="">—</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{labelForUser(u)}</option>
            ))}
          </select>
        </label>

        {error && <div className="arf-error">{error}</div>}

        <div className="arf-actions">
          <button type="submit" className="btn primary">Зберегти</button>
          <button type="button" className="btn ghost" onClick={onCancel}>Скасувати</button>
        </div>
      </form>
    </div>
  );
}
