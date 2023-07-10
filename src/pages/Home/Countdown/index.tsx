import { useContext, useEffect, useMemo } from 'react'
import { differenceInSeconds } from 'date-fns'

import { CountdownContainer, Separator } from './styles'
import { CyclesContext } from '../../../contexts/CycleContext'

export function Countdown() {
  const {
    activeCycle,
    activeCycleId,
    amountSecondsPassed,
    markCurrentCycleAsFinished,
    setSecondsPassed,
  } = useContext(CyclesContext)

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
        const secondsDifference = differenceInSeconds(
          new Date(),
          activeCycle.startDate,
        )

        // se já chegou no total de segundos, conclui o ciclo
        if (secondsDifference >= totalSeconds) {
          markCurrentCycleAsFinished()

          setSecondsPassed(totalSeconds)
          clearInterval(interval)
        } else {
          // compara a data atual com a data de inicio do ciclo para ter a conategem de segundo mais precisa
          setSecondsPassed(secondsDifference)
        }
      }, 1000)
    }

    return () => {
      clearInterval(interval)
    }
  }, [
    activeCycle,
    activeCycleId,
    markCurrentCycleAsFinished,
    setSecondsPassed,
    totalSeconds,
  ])

  // atualiza o title da pagina com a contagem
  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutes}:${seconds}`
    }
  }, [activeCycle, minutes, seconds])

  return (
    <CountdownContainer>
      <span>{minutes[0]}</span>
      <span>{minutes[1]}</span>
      <Separator>:</Separator>
      <span>{seconds[0]}</span>
      <span>{seconds[1]}</span>
    </CountdownContainer>
  )
}
