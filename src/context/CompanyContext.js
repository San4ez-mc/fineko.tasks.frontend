import React, { createContext, useContext, useState } from "react";

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
    const [activeCompany, setActiveCompany] = useState(null);

    return (
        <CompanyContext.Provider value={{ activeCompany, setActiveCompany }}>
            {children}
        </CompanyContext.Provider>
    );
}

export const useCompany = () => useContext(CompanyContext);
