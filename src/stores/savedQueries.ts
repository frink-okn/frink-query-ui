import { type InjectionKey } from 'vue'
import { useLocalStorage } from '@vueuse/core'

type Query = {
  title: string
  sources: string[]
  query: string
  timestamp: number
}

const savedQueries = useLocalStorage<Query[]>('saved-queries', [])

const saveQuery = (query: Omit<Query, 'timestamp'>) => {
  savedQueries.value.push({
    ...query,
    timestamp: Date.now()
  })
}

const overwriteQuery = (oldQuery: Query, newQuery: Omit<Query, 'timestamp'>) => {
  const indexToOverwrite = savedQueries.value.findIndex((q) => q === oldQuery)
  if (indexToOverwrite !== -1)
    savedQueries.value[indexToOverwrite] = {
      ...newQuery,
      timestamp: Date.now()
    }
  else console.error("Tried to overwrite a query that doesn't exist")
}

const deleteQuery = (query: Query) => {
  const indexToDelete = savedQueries.value.findIndex((q) => q === query)
  if (indexToDelete !== -1) savedQueries.value.splice(indexToDelete, 1)
  else console.error("Tried to delete a query that doesn't exist")
}

const deleteAllQueries = () => {
  savedQueries.value = []
}

export const savedQueriesProvider = {
  savedQueries,
  saveQuery,
  overwriteQuery,
  deleteQuery,
  deleteAllQueries
}
export const savedQueriesProviderKey = Symbol() as InjectionKey<typeof savedQueriesProvider>
