import dotenv from 'dotenv'
import path from 'path'

enum Environment {
  Production = 'production',
  Development = 'development',
  Test = 'test'
}



export function dotenvConfig ()  {
  const environment = getEnvironment()
  if (environment === null) throw new Error(`Нет конфигурации`)
  // if (environment === Environment.Production) return
  dotenv.config({
    path: path.resolve(process.cwd(), `./src/config/.env.${environment}`),
  });
}



function getEnvironment (): Environment | null {
  const env = process.env['NODE_ENV'] as Environment
  if (env === undefined ) return null
  if (!Object.values(Environment).includes(env)) return null
  return env
}