import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

import HomePage from "../pages/HomePage";
import DailyTasksPage from "../modules/tasks/pages/DailyTasksPage";
import ResultsPage from "../modules/results/pages/ResultsPage";
import TemplatesPage from "../modules/templates/pages/TemplatesPage";
import BusinessProcessesPage from "../modules/businessProcesses/pages/BusinessProcessesPage";
import BusinessProcessEditPage from "../modules/businessProcesses/pages/BusinessProcessEditPage";
import BpListPage from "../modules/bp/pages/BpListPage";
import BpEditorPage from "../modules/bp/pages/BpEditorPage";
import OrgPage from "../modules/org/pages/OrgPage";
import Layout from "../components/layout/Layout";
import TelegramGroupPage from "../modules/telegram/pages/TelegramGroupPage";
import LoginPage from "../modules/auth/pages/LoginPage";
import ForgotPasswordPage from "../modules/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../modules/auth/pages/ResetPasswordPage";
import NotFound from "../pages/NotFound";

import { useAuth } from "../context/AuthContext";

export default function AppRouter() {
    const { user } = useAuth();

    const RequireAuth = ({ children }) =>
        user ? children : <Navigate to="/auth" replace />;

    return (
        <Router>
            <Routes>
                {/* Публічні */}
                <Route path="/auth" element={<LoginPage />} />
                <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
                <Route path="/auth/reset/:token" element={<ResetPasswordPage />} />

                {/* Приватні */}
                <Route
                    path="/"
                    element={
                        <RequireAuth>
                            <HomePage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/results"
                    element={
                        <RequireAuth>
                            <ResultsPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/templates"
                    element={
                        <RequireAuth>
                            <TemplatesPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/tasks"
                    element={
                        <RequireAuth>
                            <DailyTasksPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/business-processes"
                    element={
                        <RequireAuth>
                            <BusinessProcessesPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/business-processes/new"
                    element={
                        <RequireAuth>
                            <BusinessProcessEditPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/business-processes/:id/edit"
                    element={
                        <RequireAuth>
                            <BusinessProcessEditPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/bp"
                    element={
                        <RequireAuth>
                            <BpListPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/bp/new"
                    element={
                        <RequireAuth>
                            <BpEditorPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/bp/:id"
                    element={
                        <RequireAuth>
                            <BpEditorPage />
                        </RequireAuth>
                    }
                />
                <Route element={<RequireAuth><Layout><Outlet /></Layout></RequireAuth>}>
                    <Route path="/org" element={<OrgPage />} />
                </Route>
                <Route
                    path="/telegram-group"
                    element={
                        <RequireAuth>
                            <TelegramGroupPage />
                        </RequireAuth>
                    }
                />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}
