import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout/Routes/AppLayout.tsx'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import ClientDetailPage from './pages/ClientDetailPage'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute allowedRoles={['DIETITIAN']}>
                                <UsersPage />
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
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}

export default App