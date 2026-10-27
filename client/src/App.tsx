import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout/Routes/AppLayout.tsx'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage.tsx'
import ClientDetailPage from './pages/ClientDetailPage'
import ProtectedRoute from './routes/ProtectedRoute'
import ProfilePage from './pages/ProfilePage'

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    {/* Giriş yapmadan açılan sayfalar (sekme çubuğu yok) */}
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Giriş yapılmış sayfalar: hepsi AppShell çerçevesinin içinde */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppShell />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
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