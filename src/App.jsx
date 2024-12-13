import { useState } from 'react'

import './App.css'

import Alert from './components/Alert'
import Button from './components/Button'
import Label from './components/Label'
import Container from './components/Container'

function App() {
  const [scheduleType, setScheduleType] = useState('')
  const [cronExpression, setCronExpression] = useState('')
  const [scheduleData, setScheduleData] = useState({
    timeInterval: 1,
    times: ['12:00'],
    daysOfWeek: [],
    daysOfMonth: [],
  })

  const [alert, setAlert] = useState({
    visible: false,
    message: '',
    onAccept: null,
  })

  const showAlert = (message, onAccept = null) => {
    setAlert({
      visible: true,
      message,
      onAccept
    })
  }

  const renderOption = () => {
    switch (scheduleType) {
      case 'everyXMinutes':
        return (
          <Container className='mb-4'>
            <Label className='block text-gray-700 font-medium mb-2'>Every (minutes):</Label>
            <input type='number'
              value={scheduleData.timeInterval}
              onChange={(e) => setScheduleData({ ...scheduleData, timeInterval: e.target.value })}
              className='w-full border bg-neutral-300 text-black rounded-lg px-3 py-2'
              min='1' />
          </Container>
        )

      case 'specificTimesWeek':
        return (
          <Container className='mb-4'>
            <Label className='block text-gray-700 font-medium mb-2'>Days of the week:</Label>
            <Container className='grid grid-cols-7 gap-2 mb-4'>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    const newDays = scheduleData.daysOfWeek.includes(index + 1)
                      ? scheduleData.daysOfWeek.filter(d => d !== index + 1)
                      : [...scheduleData.daysOfWeek, index + 1];
                    setScheduleData({ ...scheduleData, daysOfWeek: newDays })
                  }}
                  className={`px-3 py-2 rounded-lg border ${scheduleData.daysOfWeek.includes(index + 1) ? 'bg-blue-500 text-white' : 'bg-neutral-300 text-black'}`}>
                  {day}
                </Button>
              ))}
            </Container>

            <Container className='flex flex-col items-center mb-2'>
              <Label className='block text-gray-700 font-medium mb-2'>Hour (HH:MM):</Label>
              <input
                type='time'
                value={scheduleData.times[0]}
                onChange={(e) => {
                  const newTime = e.target.value
                  setScheduleData({ ...scheduleData, times: [newTime] })
                }}
                className='border text-black bg-neutral-300 rounded-lg px-3 py-2 w-full' />
            </Container >
          </Container>
        )

      case 'specificTimesDay':
        return (
          <Container className='mb-4'>
            <Label className='block text-gray-700 font-medium mb-2'>Specific hours (HH:MM):</Label>
            {scheduleData.times.map((time, index) => (
              <Container key={index} className='flex intems-center mb-2'>
                <input type='time'
                  value={time}
                  placeholder='HH:MM'
                  onChange={(e) => {
                    const newTimes = [...scheduleData.times]
                    newTimes[index] = e.target.value
                    setScheduleData({ ...scheduleData, times: newTimes })
                  }}
                  className='w-full border text-black bg-neutral-300 rounded-lg px-3 py-2'
                />
                <Button
                  onClick={() => {
                    const newTimes = scheduleData.times.filter((_, i) => i !== index)
                    setScheduleData({ ...scheduleData, times: newTimes })
                  }}
                  className='ml-2 bg-red-500 text-white rounded-lg w-20 font-medium border border-black hover:text-red-700'
                >Delete
                </Button>
              </Container>
            ))}
            <Button
              onClick={() => {
                if (scheduleData.times.length >= 2) {
                  return showAlert('You can select only 2 hours',
                    () => {
                      setAlert({ ...alert, visible: false })
                    })
                }
                setScheduleData({ ...scheduleData, times: [...scheduleData.times, ''] })
              }}
              className='bg-blue-500 font-medium border border-black text-white px-4 py-2 rounded-lg hover:bg-blue-600'
            >
              Add hour
            </Button>
          </Container >
        )

      case 'specificDaysMonth':
        return (
          <Container className='mb-4'>
            <Label className='block text-gray-700 font-medium mb-2'>Days of the month:</Label>
            <input
              type='text'
              value={scheduleData.daysOfMonth}
              onChange={(e) => {
                const newDays = e.target.value.split(',').map(day => day.trim())
                setScheduleData({ ...scheduleData, daysOfMonth: newDays })
              }}
              placeholder='Example: 1,15,30'
              className='w-full border text-black bg-neutral-300 rounded-lg px-3 py-2'
            />
          </Container>
        )

      default:
        return null
    }
  }

  const handleSaveCron = () => {
    try {
      const createdCron = createCronFromSchedule(scheduleType)

      setCronExpression(createdCron)
    } catch (error) {
      console.error(error)

      showAlert('Failed creating the CRON expression',
        () => {
          setAlert({ ...alert, visible: false })
        })
    }
  }

  const hanleLoadCron = () => {
    const validCron = loadCronIntoSchedule(cronExpression)

    if (!validCron) {
      showAlert(
        'The CRON expression is not valid',
        () => {
          setAlert({ ...alert, visible: false })
        })
    } else {
      showAlert(
        'The CRON expression is valid',
        () => {
          setAlert({ ...alert, visible: false })
        })
    }
  }

  const createCronFromSchedule = (type) => {
    switch (type) {
      case 'everyXMinutes':

        return `*/${scheduleData.timeInterval} * * * *`

      case 'specificTimesWeek':
        const days = scheduleData.daysOfWeek.join(',')

        if (scheduleData.daysOfWeek.length === 0) {
          showAlert(
            'Please select at least one day of the week',
            () => {
              setAlert({ ...alert, visible: false })
            })

          return '* * * * *'
        }

        return scheduleData.times.map(time => {
          const [hour, minute] = time.split(':')
          return `${minute} ${hour} * * ${days}`
        }).join(',')

      case 'specificTimesDay':
        const validTimes = scheduleData.times.filter(time => time && time.includes(':'))

        if (scheduleData.times.length === 0) {
          showAlert(
            'Please select at least one time',
            () => {
              setAlert({ ...alert, visible: false })
            })
          return '* * * * *'
        }

        const minutes = validTimes.map(time => time.split(':')[1]).join(',');
        const hours = validTimes.map(time => time.split(':')[0]).join(',');

        return `${minutes} ${hours} * * *`

      case 'specificDaysMonth':
        const daysOfMonth = scheduleData.daysOfMonth.join(',')

        const validDays = daysOfMonth.split(',')
          .map(day => Number(day))

        if (validDays.every(day => day >= 1 && day <= 31)) {

          return `* * ${daysOfMonth} * *`

        } else {
          showAlert(
            'Numbers must be between 1 and 31',
            () => {
              setAlert({ ...alert, visible: false })
            })
        }

      default:
        return '* * * * *'
    }
  }

  const loadCronIntoSchedule = (cron) => {
    try {
      const cronParts = cron.split(' ')

      if (cronParts.length !== 5) throw new Error('CRON is not valid')

      const [minute, hour, dayOfMonth, month, dayOfWeek] = cronParts

      if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        setScheduleData('everyXMinutes')
        setScheduleData({ ...scheduleData, timeInterval: parseInt(minute.replace('*/', ''), 10) })
        return true
      }

      if (dayOfWeek !== '*' && dayOfMonth === '*' && month === '*') {
        const daysOfWeek = dayOfWeek.split(',').map(Number)

        const times = hour.split(',').map((h, i) => `${h}:${minute.split(',')[i]}`)

        setScheduleType('specificTimesWeek')
        setScheduleData({ ...scheduleData, times, daysOfWeek })
        return true
      }

      if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        const times = minute.split(',').map((min, i) => {
          const hr = hour.split(',')[i]
          return `${hr}:${min}`
        })

        setScheduleType('specificTimesDay')
        setScheduleData({ ...scheduleData, times })
        return true
      }

      if (minute === '*' && hour === '*' && dayOfWeek === '*' && month === '*') {
        const daysOfMonth = dayOfMonth.split(',').map(Number)

        setScheduleType('specificDaysMonth')
        setScheduleData({ ...scheduleData, daysOfMonth })
        return true

      }

      return false

    } catch (error) {
      console.error('Failed loading the CRON expression', error)

      return false
    }
  }


  return (
    <>
      <Container className='bg-gray-100 p-20 rounded-lg'>
        <Container className='max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md'>
          <h1 className='text-5xl font-bold mb-4 text-center text-black'>Cron Schedule Creator</h1>

          <Container className='mb-4'>
            <Label className='block text-gray-800 font-medium b-2 mb-2'>Select an option:</Label>
            <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)}
              className='w-full border rounded-lg px-3 py-2 bg-neutral-300 text-black text-sm'>
              <option value=''></option>
              <option value='everyXMinutes'>Every X minute</option>
              <option value='specificTimesWeek'>Every X hour on a selected day</option>
              <option value='specificTimesDay'>Every specific hour every day</option>
              <option value='specificDaysMonth'>Every specific days of the month</option>
            </select>
          </Container>

          {renderOption()}

          <Container className='flex flex-row justify-center gap-10'>
            <Button onClick={handleSaveCron} className='bg-blue-500 text-white font-bold px-4 py-2 border border-black rounded-lg hover:bg-blue-600'>Save</Button>
            <Button onClick={hanleLoadCron} className='bg-green-500 text-white font-bold px-4 py-2 border border-black rounded-lg hover:bg-green-600'>Load</Button>
          </Container>

          <Container className='mt-10'>
            <Label className='block text-gray-700 text-2xl font-bold mb-2'>Cron Expression</Label>
            <input disabled value={cronExpression} className='w-full border rounded-xl bg-neutral-300 bg-rounded-lg text-black text-2xl text-center px-3 py-2 h-24' />
          </Container>
        </Container>

        {alert.visible &&
          <Alert
            message={alert.message}
            type={alert.type}
            onAccept={alert.onAccept} />}
      </Container >
    </>
  )
}

export default App
