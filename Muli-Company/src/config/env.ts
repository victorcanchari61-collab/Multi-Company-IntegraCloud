// Único punto de acceso a las variables de entorno.
// El resto de la app importa `env`, nunca `import.meta.env` directo.

export const env = {
  API_URL: import.meta.env.VITE_API_URL,
} as const
