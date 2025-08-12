import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import './AddResultForm.css';

export default function AddResultForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    final_result: '',
    urgent: false,
    description: '',
    responsible_id: ''
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

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
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        title: form.title,
        final_result: form.final_result,
        urgent: form.urgent,
        description: form.description,
        responsible_id: Number(form.responsible_id)
      };
      await api.post('/results', payload);
      onSaved && onSaved();
      setForm({ title: '', final_result: '', urgent: false, description: '', responsible_id: '' });
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
