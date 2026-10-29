import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout/Routes/AppLayout.tsx'
import AppShell from './components/AppShell'
import ProtectedRoute from './routes/ProtectedRoute'
import IntakeGate from './routes/IntakeGate'

// Sayfalar ayrı dosyalara bölünür ve açıldıklarında yüklenir: tanıtım sayfası grafik ve editör kodunu indirmez
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ClientsPage = lazy(() => import('./pages/ClientsPage'))
const ClientDetailPage = lazy(() => import('./pages/ClientDetailPage'))
const IntakePage = lazy(() => import('./pages/IntakePage'))
const MenuPage = lazy(() => import('./pages/MenuPage'))
const DietPlanEditorPage = lazy(() => import('./pages/DietPlanEditorPage'))
const DietLibraryPage = lazy(() => import('./pages/DietLibraryPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                {/* Sayfa dosyası inerken krem zemin (kısa sürer) */}
                <Suspense fallback={null}>
                    <Routes>
                        {/* Herkese açık tanıtım sayfası */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Giriş yapmadan açılan sayfalar (sekme çubuğu yok) */}
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
                            <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
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
                                path="/library"
                                element={
                                    <ProtectedRoute allowedRoles={['DIETITIAN']}>
                                        <DietLibraryPage />
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

                        {/* Bilinmeyen adres */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </AppLayout>
        </BrowserRouter>
    )
}

export default App
