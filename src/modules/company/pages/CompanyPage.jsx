import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useCompany } from "../../../context/CompanyContext";
import { getCompany, updateCompany, getEmployees, createEmployee } from "../api/company";
import "./CompanyPage.css";

export default function CompanyPage() {
  const { setActiveCompany } = useCompany();
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ first_name: "", last_name: "", telegram_user_id: "" });

  useEffect(() => {
    async function load() {
      try {
        const c = await getCompany();
        setCompany(c);
        setActiveCompany(c);
        const e = await getEmployees();
        setEmployees(Array.isArray(e.items) ? e.items : e);
      } catch (e) {
        console.error("Failed to load company", e);
      }
    }
    load();
  }, [setActiveCompany]);

  const handleNameChange = (e) => {
    setCompany((prev) => ({ ...prev, name: e.target.value }));
  };

  const saveName = async () => {
    try {
      const updated = await updateCompany({ name: company?.name });
      setCompany(updated);
      setActiveCompany(updated);
    } catch (e) {
      console.error("Failed to update company", e);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      const newEmp = await createEmployee(form);
      setEmployees((prev) => [...prev, newEmp]);
      setForm({ first_name: "", last_name: "", telegram_user_id: "" });
    } catch (err) {
      console.error("Failed to create employee", err);
    }
  };

  return (
    <Layout>
      <div className="company-page">
        <div className="company-page__header">
          <input
            type="text"
            value={company?.name || ""}
            onChange={handleNameChange}
          />
          <button className="btn primary" onClick={saveName}>
            Зберегти
          </button>
        </div>

        <div className="company-page__employees">
          <h2>Працівники</h2>
          <table>
            <thead>
              <tr>
                <th>Ім'я</th>
                <th>Прізвище</th>
                <th>Telegram ID</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.first_name}</td>
                  <td>{emp.last_name}</td>
                  <td>{emp.telegram_user_id}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form className="company-page__form" onSubmit={addEmployee}>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleFormChange}
              placeholder="Ім'я"
              required
            />
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleFormChange}
              placeholder="Прізвище"
              required
            />
            <input
              name="telegram_user_id"
              value={form.telegram_user_id}
              onChange={handleFormChange}
              placeholder="Telegram ID"
              required
            />
            <button type="submit" className="btn primary">
              Додати
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
