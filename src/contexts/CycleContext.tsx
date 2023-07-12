import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'

import { Cycle, cyclesReducer } from '../reducers/cycles/reducer'
import {
  addNewCycleAction,
  interruptCurrentCycleAction,
  markCurrentCycleAsFinishedAction,
} from '../reducers/cycles/actions'
import { differenceInSeconds } from 'date-fns'

export interface CreateCycleData {
  task: string
  minutesAmount: number
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
  const [cyclesState, dispatch] = useReducer(
    cyclesReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    (initialState) => {
      const storedStateAsJson = localStorage.getItem(
        '@react-timer:cycles-state-1.0.0',
      )

      if (storedStateAsJson) {
        return JSON.parse(storedStateAsJson)
      }

      return initialState
    },
  )

  const { cycles, activeCycleId } = cyclesState
  const activeCycle = useMemo(
    () => cycles.find((c) => c.id === activeCycleId),
    [activeCycleId, cycles],
  )

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    if (activeCycle) {
      const secondsDifference = differenceInSeconds(
        new Date(),
        new Date(activeCycle.startDate),
      )

      return secondsDifference
    }
    return 0
  })

  useEffect(() => {
    const stateJson = JSON.stringify(cyclesState)

    localStorage.setItem('@react-timer:cycles-state-1.0.0', stateJson)
  }, [cyclesState])

  const interruptCurrentCycle = useCallback(() => {
    dispatch(interruptCurrentCycleAction())
  }, [])

  const markCurrentCycleAsFinished = useCallback(() => {
    dispatch(markCurrentCycleAsFinishedAction())
  }, [])

  const createNewCycle = useCallback((data: CreateCycleData) => {
    const id = new Date().getTime().toString()

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    dispatch(addNewCycleAction(newCycle))

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
