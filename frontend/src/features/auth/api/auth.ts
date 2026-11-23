import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Usuario, UsuarioCreate } from '../../usuarios/types/usuario'

export async function registrarUsuario(datos: UsuarioCreate): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/auth/register', datos)
  return data
}
