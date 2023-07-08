import { useCallback, useEffect, useMemo, useState } from 'react'
import { Play } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { differenceInSeconds } from 'date-fns'

import {
  CountdownContainer,
  FormContainer,
  HomeContainer,
  MinutesAmountInput,
  Separator,
  StartCountdownButton,
  TaskInput,
} from './styles'

const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod
    .number()
    .min(5, 'O ciclo deve ser no mínimo 5 minutos')
    .max(60, 'O ciclo deve ser no máximo 60 minutos'),
})

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
}

export function Home() {
  const { register, handleSubmit, watch, reset } = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  // pega o ciclo ativo
  const activeCycle = useMemo(
    () => cycles.find((c) => c.id === activeCycleId),
    [activeCycleId, cycles],
  )

  // pega o total de segundos do ciclo ativo
  const totalSeconds = useMemo(
    () => (activeCycle ? activeCycle.minutesAmount * 60 : 0),
    [activeCycle],
  )
  // calcula o segundo total menos a quantidade de segundos que já passou
  const currentSeconds = useMemo(
    () => (activeCycle ? totalSeconds - amountSecondsPassed : 0),
    [activeCycle, amountSecondsPassed, totalSeconds],
  )

  // converte os segundos em minutos
  const minutesAmount = useMemo(
    () => Math.floor(currentSeconds / 60),
    [currentSeconds],
  )
  // pega a quantidade de segundos do resto da divisão da conversão de minutos
  const secondsAmount = useMemo(() => currentSeconds % 60, [currentSeconds])

  // transforma os minutos para string e concatena um zero quando estiver apenas 1 caracter
  const minutes = useMemo(
    () => `${minutesAmount}`.padStart(2, '0'),
    [minutesAmount],
  )
  // transforma os segundos para string e concatena um zero quando estiver apenas 1 caracter
  const seconds = useMemo(
    () => `${secondsAmount}`.padStart(2, '0'),
    [secondsAmount],
  )

  // inicia a contagem do ciclo
  useEffect(() => {
    let interval: number
    if (activeCycle) {
      interval = setInterval(() => {
        // compara a data atual com a data de inicio do ciclo para ter a conategem de segundo mais precisa
        setAmountSecondsPassed(
          differenceInSeconds(new Date(), activeCycle.startDate),
        )
      }, 1000)
    }

    return () => {
      clearInterval(interval)
    }
  }, [activeCycle])

  const onSubmit = useCallback(
    (data: NewCycleFormData) => {
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

      reset()
    },
    [reset],
  )

  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutes}:${seconds}`
    }
  }, [activeCycle, minutes, seconds])

  const task = watch('task')
  const isSubmitDisabled = useMemo(() => {
    return !task
  }, [task])

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(onSubmit)} action="">
        <FormContainer>
          <label htmlFor="task">Vou trabalhar em</label>
          <TaskInput
            id="task"
            type="text"
            placeholder="De um nome para o seu projeto"
            list="task-sugestions"
            {...register('task')}
          />

          <datalist id="task-sugestions">
            <option value="Projeto 1"></option>
            <option value="Projeto 2"></option>
            <option value="Projeto 3"></option>
            <option value="Projeto 4"></option>
            <option value="Teste"></option>
          </datalist>

          <label htmlFor="minutesAmount">Durante</label>
          <MinutesAmountInput
            id="minutesAmount"
            type="number"
            placeholder="00"
            step={5}
            min={5}
            max={60}
            {...register('minutesAmount', { valueAsNumber: true })}
          />

          <span>minutos.</span>
        </FormContainer>

        <CountdownContainer>
          <span>{minutes[0]}</span>
          <span>{minutes[1]}</span>
          <Separator>:</Separator>
          <span>{seconds[0]}</span>
          <span>{seconds[1]}</span>
        </CountdownContainer>

        <StartCountdownButton type="submit" disabled={isSubmitDisabled}>
          <Play size={24} />
          Começar
        </StartCountdownButton>
      </form>
    </HomeContainer>
  )
}
