import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import AppLayout from '../layouts/AppLayout'
import FarmLayout from '../layouts/FarmLayout'
import FieldLayout from '../layouts/FieldLayout'
import LivestockLayout from '../layouts/LivestockLayout'
import ProtectedRoute from './ProtectedRoute'

const AnimalDetailPage = lazy(() => import('../pages/AnimalDetailPage'))
const AnimalsPage = lazy(() => import('../pages/AnimalsPage'))
const AssistantPage = lazy(() => import('../pages/AssistantPage'))
const BulkAnimalsPage = lazy(() => import('../pages/BulkAnimalsPage'))
const CropsPage = lazy(() => import('../pages/CropsPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const EditCropPage = lazy(() => import('../pages/EditCropPage'))
const EditFieldPage = lazy(() => import('../pages/EditFieldPage'))
const EditTaskPage = lazy(() => import('../pages/EditTaskPage'))
const EditInventoryItemPage = lazy(() => import('../pages/EditInventoryItemPage'))
const EditMachineryPage = lazy(() => import('../pages/EditMachineryPage'))
const EditMaintenancePage = lazy(() => import('../pages/EditMaintenancePage'))
const FarmsPage = lazy(() => import('../pages/FarmsPage'))
const FieldsPage = lazy(() => import('../pages/FieldsPage'))
const HealthPage = lazy(() => import('../pages/HealthPage'))
const HerdsPage = lazy(() => import('../pages/HerdsPage'))
const InventoryPage = lazy(() => import('../pages/InventoryPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const MoveAnimalPage = lazy(() => import('../pages/MoveAnimalPage'))
const MoveHerdPage = lazy(() => import('../pages/MoveHerdPage'))
const MachineryDetailPage = lazy(() => import('../pages/MachineryDetailPage'))
const MachineryPage = lazy(() => import('../pages/MachineryPage'))
const NewAnimalPage = lazy(() => import('../pages/NewAnimalPage'))
const NewHealthEventPage = lazy(() => import('../pages/NewHealthEventPage'))
const NewReproductionEventPage = lazy(() => import('../pages/NewReproductionEventPage'))
const NewProductionPage = lazy(() => import('../pages/NewProductionPage'))
const NewWeighingPage = lazy(() => import('../pages/NewWeighingPage'))
const NewHerdPage = lazy(() => import('../pages/NewHerdPage'))
const NewCropPage = lazy(() => import('../pages/NewCropPage'))
const EditAnimalPage = lazy(() => import('../pages/EditAnimalPage'))
const EditHealthEventPage = lazy(() => import('../pages/EditHealthEventPage'))
const EditReproductionEventPage = lazy(() => import('../pages/EditReproductionEventPage'))
const EditProductionPage = lazy(() => import('../pages/EditProductionPage'))
const EditWeighingPage = lazy(() => import('../pages/EditWeighingPage'))
const EditHerdPage = lazy(() => import('../pages/EditHerdPage'))
const EditFarmPage = lazy(() => import('../pages/EditFarmPage'))
const NewFarmPage = lazy(() => import('../pages/NewFarmPage'))
const NewFieldPage = lazy(() => import('../pages/NewFieldPage'))
const NewInventoryItemPage = lazy(() => import('../pages/NewInventoryItemPage'))
const NewMachineryPage = lazy(() => import('../pages/NewMachineryPage'))
const NewMaintenancePage = lazy(() => import('../pages/NewMaintenancePage'))
const NewTaskPage = lazy(() => import('../pages/NewTaskPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const ProductionPage = lazy(() => import('../pages/ProductionPage'))
const ReproductionPage = lazy(() => import('../pages/ReproductionPage'))
const RetireAnimalPage = lazy(() => import('../pages/RetireAnimalPage'))
const TasksPage = lazy(() => import('../pages/TasksPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const ReportsPage = lazy(() => import('../pages/ReportsPage'))
const WeatherPage = lazy(() => import('../pages/WeatherPage'))

function AppRoutes() {
  return (
    <Suspense fallback={<p className="p-6 text-gray-600">Cargando...</p>}>
      <Routes>
        <Route path="/" element={<Navigate to="/farms" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/farms" element={<FarmsPage />} />
            <Route path="/farms/new" element={<NewFarmPage />} />

            <Route path="/farms/:farmId" element={<FarmLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              <Route path="fields" element={<FieldsPage />} />
              <Route path="fields/new" element={<NewFieldPage />} />
              <Route path="fields/:fieldId/edit" element={<EditFieldPage />} />

              <Route path="fields/:fieldId" element={<FieldLayout />}>
                <Route index element={<Navigate to="crops" replace />} />
                <Route path="crops" element={<CropsPage />} />
                <Route path="crops/new" element={<NewCropPage />} />
                <Route path="crops/:cropId/edit" element={<EditCropPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="tasks/new" element={<NewTaskPage />} />
                <Route path="tasks/:taskId/edit" element={<EditTaskPage />} />
              </Route>

              <Route path="livestock" element={<LivestockLayout />}>
                <Route index element={<Navigate to="herds" replace />} />
                <Route path="herds" element={<HerdsPage />} />
                <Route path="animals" element={<AnimalsPage />} />
                <Route path="health" element={<HealthPage />} />
                <Route path="reproduction" element={<ReproductionPage />} />
                <Route path="productions" element={<ProductionPage />} />
              </Route>
              <Route path="livestock/herds/new" element={<NewHerdPage />} />
              <Route path="livestock/herds/:herdId/edit" element={<EditHerdPage />} />
              <Route path="livestock/herds/:herdId/move" element={<MoveHerdPage />} />
              <Route path="livestock/animals/new" element={<NewAnimalPage />} />
              <Route path="livestock/animals/bulk" element={<BulkAnimalsPage />} />
              <Route path="livestock/animals/:animalId" element={<AnimalDetailPage />} />
              <Route path="livestock/animals/:animalId/edit" element={<EditAnimalPage />} />
              <Route path="livestock/animals/:animalId/move" element={<MoveAnimalPage />} />
              <Route path="livestock/animals/:animalId/retire" element={<RetireAnimalPage />} />
              <Route
                path="livestock/animals/:animalId/weighings/new"
                element={<NewWeighingPage />}
              />
              <Route
                path="livestock/animals/:animalId/weighings/:weighingId/edit"
                element={<EditWeighingPage />}
              />
              <Route path="livestock/health/new" element={<NewHealthEventPage />} />
              <Route path="livestock/health/:eventId/edit" element={<EditHealthEventPage />} />
              <Route path="livestock/reproduction/new" element={<NewReproductionEventPage />} />
              <Route
                path="livestock/reproduction/:eventId/edit"
                element={<EditReproductionEventPage />}
              />
              <Route path="livestock/productions/new" element={<NewProductionPage />} />
              <Route
                path="livestock/productions/:productionId/edit"
                element={<EditProductionPage />}
              />

              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/new" element={<NewInventoryItemPage />} />
              <Route path="inventory/:itemId/edit" element={<EditInventoryItemPage />} />

              <Route path="machinery" element={<MachineryPage />} />
              <Route path="machinery/new" element={<NewMachineryPage />} />
              <Route path="machinery/:machineryId" element={<MachineryDetailPage />} />
              <Route path="machinery/:machineryId/edit" element={<EditMachineryPage />} />
              <Route
                path="machinery/:machineryId/maintenances/new"
                element={<NewMaintenancePage />}
              />
              <Route
                path="machinery/:machineryId/maintenances/:maintenanceId/edit"
                element={<EditMaintenancePage />}
              />

              <Route path="settings" element={<EditFarmPage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="weather" element={<WeatherPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
