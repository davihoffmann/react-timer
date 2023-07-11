import { ActionTypes } from './actions'

export interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

interface CyclesState {
  cycles: Cycle[]
  activeCycleId: string | null
}

export function cyclesReducer(state: CyclesState, action: any) {
  switch (action.type) {
    case ActionTypes.ADD_NEW_CYCLE:
      return {
        ...state,
        cycles: [...state.cycles, action.payload.newCycle],
        activeCycleId: action.payload.newCycle.id,
      }

    case ActionTypes.INTERRUPT_CURRENT_CYCLE:
      return {
        ...state,
        cyles: state.cycles.map((s) => {
          if (s.id === state.activeCycleId) {
            return {
              ...s,
              interruptedDate: new Date(),
            }
          }
          return s
        }),
        activeCycleId: null,
      }

    case ActionTypes.MARK_CURRENT_CYCLE_AS_FINISHED:
      return {
        ...state,
        cyles: state.cycles.map((s) => {
          if (s.id === state.activeCycleId) {
            return {
              ...s,
              finishedDate: new Date(),
            }
          }
          return s
        }),
      }

    default:
      return state
  }
}
