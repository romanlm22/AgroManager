import { Navigate, Route, Routes } from 'react-router'
import AppLayout from '../layouts/AppLayout'
import FarmLayout from '../layouts/FarmLayout'
import DashboardPage from '../pages/DashboardPage'
import FarmsPage from '../pages/FarmsPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProtectedRoute from './ProtectedRoute'
import NewFarmPage from '../pages/NewFarmPage'
import EditFieldPage from '../pages/EditFieldPage'
import FieldsPage from '../pages/FieldsPage'
import NewFieldPage from '../pages/NewFieldPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/farms" replace />} />
      <Route path="/farms" element={<FarmsPage />} />
      <Route path="/farms/new" element={<NewFarmPage />} />
      <Route path="/farms/:farmId" element={<FarmLayout />}></Route>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farms/:farmId" element={<FarmLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="fields" element={<FieldsPage />} />
            <Route path="fields/new" element={<NewFieldPage />} />
            <Route path="fields/:fieldId/edit" element={<EditFieldPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes