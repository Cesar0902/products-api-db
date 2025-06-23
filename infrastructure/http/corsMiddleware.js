import cors from 'cors'

// Obtener los orígenes permitidos desde las variables de entorno
const getAcceptedOrigins = () => {
  const corsOrigins = process.env.CORS_ORIGINS
  if (corsOrigins) {
    return corsOrigins.split(',').map(origin => origin.trim())
  }
  return ['http://localhost:3000'] // fallback por defecto
}

const ACCEPTED_ORIGINS = getAcceptedOrigins()

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    if (acceptedOrigins.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
})
