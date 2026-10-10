import { Link } from 'react-router'
import type { Farm, FarmRole } from '../../types/farm'

const roleLabels: Record<FarmRole, string> = {
  OWNER: 'Propietario',
  MEMBER: 'Miembro',
}

function FarmCard({ farm }: { farm: Farm }) {
  return (
    <Link
      to={`/farms/${farm.id}/dashboard`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-600 hover:shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold text-gray-900">{farm.name}</h2>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          {roleLabels[farm.myRole]}
        </span>
      </div>

      {farm.location && <p className="mt-1 text-sm text-gray-600">{farm.location}</p>}

      {farm.totalAreaHa !== null && (
        <p className="mt-3 text-sm text-gray-700">
          {farm.totalAreaHa.toLocaleString('es-AR')} ha
        </p>
      )}
    </Link>
  )
}

export default FarmCard