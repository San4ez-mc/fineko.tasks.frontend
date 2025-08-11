import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import TemplatesFilters from "../components/TemplatesFilters";
import TemplateRow from "../components/TemplateRow";
import TemplateDetails from "../components/TemplateDetails";
import TemplatesEmpty from "../components/TemplatesEmpty";
import "./TemplatesPage.css";

export default function TemplatesPage() {
  const [filters, setFilters] = useState({ q: "", resultId: "any", priority: "any", defaultAssigneeId: "any", view: "list" });
  const [expandedId, setExpandedId] = useState(null);
  const data = [];

  const onReset = () => setFilters({ q: "", resultId: "any", priority: "any", defaultAssigneeId: "any", view: "list" });
  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <Layout>
      <div className="templates-page">
        <h1>Шаблони</h1>
        <TemplatesFilters value={filters} onChange={setFilters} onReset={onReset} />
        {data.length === 0 ? (
          <TemplatesEmpty onCreate={() => {}} />
        ) : (
          <div className="tpl-list">
            {data.map((t) => (
              <React.Fragment key={t.id}>
                <TemplateRow
                  template={t}
                  expanded={expandedId === t.id}
                  onExpand={toggleExpand}
                  onCreateTask={() => {}}
                  onEdit={() => {}}
                  onArchive={() => {}}
                  onDelete={() => {}}
                />
                {expandedId === t.id && (
                  <TemplateDetails
                    template={t}
                    onInlineUpdate={() => {}}
                    onCreateTask={() => {}}
                    onLinkResult={() => {}}
                    onUnlinkResult={() => {}}
                    onDuplicate={() => {}}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
