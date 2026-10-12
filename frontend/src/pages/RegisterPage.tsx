import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Link, Navigate, useNavigate } from 'react-router'
import { z } from 'zod'
import FormField from '../components/FormField'
import { inputClassName } from '../components/formStyles'
import { useAuth } from '../hooks/useAuth'

const roleOptions = [
  { value: 'PRODUCER', label: 'Productor' },
  { value: 'AGRONOMIST', label: 'Ingeniero agrónomo' },
  { value: 'EMPLOYEE', label: 'Empleado' },
] as const

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, { error: 'Ingresá tu nombre' }),
    lastName: z.string().trim().min(1, { error: 'Ingresá tu apellido' }),
    email: z.email({ error: 'Ingresá un email válido' }),
    role: z.enum(['PRODUCER', 'AGRONOMIST', 'EMPLOYEE']),
    password: z.string().min(8, { error: 'La contraseña debe tener al menos 8 caracteres' }),
    confirmPassword: z.string().min(1, { error: 'Repetí la contraseña' }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

function RegisterPage() {
  const { isAuthenticated, register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'PRODUCER' as const,
      password: '',
      confirmPassword: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/farms" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)

    try {
      await registerUser({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email,
        role: values.role,
        password: values.password,
      })
      navigate('/farms', { replace: true })
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setServerError('Ya existe una cuenta con ese email.')
      } else if (isAxiosError(error) && error.response?.status === 400) {
        setServerError('Revisá los datos ingresados e intentá de nuevo.')
      } else {
        setServerError('No se pudo conectar con el servidor. Intentá de nuevo.')
      }
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-8">
      <form
        onSubmit={onSubmit}
        noValidate
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <div>
          <h1 className="text-2xl font-bold text-green-800">AgroManager</h1>
          <p className="text-sm text-gray-600">Creá tu cuenta</p>
        </div>

        {serverError && (
          <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="firstName" error={errors.firstName?.message}>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              {...register('firstName')}
              className={inputClassName}
            />
          </FormField>

          <FormField label="Apellido" htmlFor="lastName" error={errors.lastName?.message}>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              {...register('lastName')}
              className={inputClassName}
            />
          </FormField>
        </div>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Soy" htmlFor="role" error={errors.role?.message}>
          <select id="role" {...register('role')} className={inputClassName}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Contraseña"
          htmlFor="password"
          error={errors.password?.message}
          hint="Mínimo 8 caracteres."
        >
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Repetir contraseña"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={inputClassName}
          />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-green-700 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
