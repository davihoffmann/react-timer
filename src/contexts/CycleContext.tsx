import { ReactNode, createContext, useCallback, useMemo, useState } from 'react'

export interface CreateCycleData {
  task: string
  minutesAmount: number
}

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

interface CyclesContextType {
  cycles: Cycle[]
  activeCycle?: Cycle
  activeCycleId: string | null
  amountSecondsPassed: number
  markCurrentCycleAsFinished: () => void
  interruptCurrentCycle: () => void
  createNewCycle: (data: CreateCycleData) => void
  setSecondsPassed: (seconds: number) => void
}

export const CyclesContext = createContext({} as CyclesContextType)

interface CyclesContextProviderProps {
  children: ReactNode
}

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  // pega o ciclo ativo
  const activeCycle = useMemo(
    () => cycles.find((c) => c.id === activeCycleId),
    [activeCycleId, cycles],
  )

  const interruptCurrentCycle = useCallback(() => {
    setCycles((state) =>
      state.map((s) => {
        if (s.id === activeCycleId) {
          return {
            ...s,
            interruptedDate: new Date(),
          }
        }
        return s
      }),
    )
    setActiveCycleId(null)
  }, [activeCycleId])

  const markCurrentCycleAsFinished = useCallback(() => {
    setCycles((state) =>
      state.map((s) => {
        if (s.id === activeCycleId) {
          return {
            ...s,
            finishedDate: new Date(),
          }
        }
        return s
      }),
    )
  }, [activeCycleId])

  const createNewCycle = useCallback((data: CreateCycleData) => {
    const id = new Date().getTime().toString()

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    setCycles((prevState) => [...prevState, newCycle])
    setActiveCycleId(id)
    setAmountSecondsPassed(0)
  }, [])

  const setSecondsPassed = useCallback((seconds: number) => {
    setAmountSecondsPassed(seconds)
  }, [])

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        amountSecondsPassed,
        markCurrentCycleAsFinished,
        interruptCurrentCycle,
        createNewCycle,
        setSecondsPassed,
      }}
    >
      {children}
    </CyclesContext.Provider>
  )
}
