import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout/Routes/AppLayout.tsx'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage.tsx'
import ClientDetailPage from './pages/ClientDetailPage'
import IntakePage from './pages/IntakePage'
import ProtectedRoute from './routes/ProtectedRoute'
import IntakeGate from './routes/IntakeGate'
import ProfilePage from './pages/ProfilePage'
import MenuPage from './pages/MenuPage'
import DietPlanEditorPage from './pages/DietPlanEditorPage'

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    {/* Giriş yapmadan açılan sayfalar (sekme çubuğu yok) */}
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Ön görüşme formu: danışana özel, sekme çubuğu yok */}
                    <Route
                        path="/intake"
                        element={
                            <ProtectedRoute allowedRoles={['CLIENT']}>
                                <IntakePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Giriş yapılmış sayfalar: hepsi AppShell çerçevesinin içinde.
                        IntakeGate, formu doldurmamış danışanı önce forma gönderir. */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <IntakeGate>
                                    <AppShell />
                                </IntakeGate>
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route
                            path="/menu"
                            element={
                                <ProtectedRoute allowedRoles={['CLIENT']}>
                                    <MenuPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/clients/:id/diet-plans/:planId"
                            element={
                                <ProtectedRoute allowedRoles={['DIETITIAN']}>
                                    <DietPlanEditorPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/clients"
                            element={
                                <ProtectedRoute allowedRoles={['DIETITIAN']}>
                                    <ClientsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/clients/:id"
                            element={
                                <ProtectedRoute allowedRoles={['DIETITIAN']}>
                                    <ClientDetailPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    {/* Eski adres yeni adrese yönlendirilir */}
                    <Route path="/users" element={<Navigate to="/clients" replace />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}

export default App
