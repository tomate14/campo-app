import { useQuery } from '@tanstack/react-query'
import { getRazasBovinas } from '../api/ganaderia'

const RAZAS_KEY = 'razas-bovinas'

export function useRazasBovinas() {
  return useQuery({
    queryKey: [RAZAS_KEY],
    queryFn: () => getRazasBovinas(),
  })
}
