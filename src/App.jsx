import { useState } from 'react'
import { Container, Button, Label, Alert } from './components/index'
import { useAlert } from './hooks/useAlert'

import logic from './utils/index'

import './styles/App.css'

function App() {
  const { alert, showAlert, hideAlert } = useAlert()
  const [scheduleType, setScheduleType] = useState('')
  const [cronExpression, setCronExpression] = useState('')
  const [scheduleData, setScheduleData] = useState({
    timeInterval: 1,
    times: ['12:00'],
    daysOfWeek: [],
    daysOfMonth: [],
  })

  const renderOption = () => {
    switch (scheduleType) {
      case 'everyXMinutes':
        return (
          <Container className='mb-4'>
            <Label className='block text-gray-700 font-medium mb-2'>Every (minutes):</Label>
            <input type='number'
              placeholder='1'
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
                    const newDays = (scheduleData.daysOfWeek || []).includes(index + 1)
                      ? scheduleData.daysOfWeek.filter(d => d !== index + 1)
                      : [...(scheduleData.daysOfWeek || []), index + 1];
                    setScheduleData({ ...scheduleData, daysOfWeek: newDays })
                  }}
                  className={`px-3 py-2 rounded-lg border ${(scheduleData.daysOfWeek || []).includes(index + 1) ? 'bg-blue-500 text-white' : 'bg-neutral-300 text-black'}`}>
                  {day}
                </Button>
              ))}
            </Container>

            <Container className='flex flex-col items-center mb-2'>
              <Label className='block text-gray-700 font-medium mb-2'>Hour (HH:MM):</Label>
              <input
                type='time'
                value={scheduleData.times}
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
            {(scheduleData.times || []).map((time, index) => (
              <Container key={index} className='flex intems-center mb-2'>
                <input type='time'
                  value={time}
                  placeholder='HH:MM'
                  onChange={(e) => {
                    const newTimes = [...(scheduleData.times || [])]
                    newTimes[index] = e.target.value
                    setScheduleData({ ...scheduleData, times: newTimes })
                  }}
                  className='w-full border text-black bg-neutral-300 rounded-lg px-3 py-2'
                />
                {(scheduleData.times || []).length > 1 && <Button
                  onClick={() => {
                    const newTimes = (scheduleData.times || []).filter((_, i) => i !== index)
                    setScheduleData({ ...scheduleData, times: newTimes })
                  }}
                  className='ml-2 bg-red-500 text-white rounded-lg w-20 font-medium border border-black hover:text-red-700'
                >Delete
                </Button>}
              </Container>
            ))}
            <Button
              onClick={() => {
                if ((scheduleData.times || []).length >= 2) {
                  return showAlert('You can select only 2 hours',
                    () => {
                      hideAlert({ ...alert, visible: false })
                    })
                }
                setScheduleData({ ...scheduleData, times: [...(scheduleData.times || []), ''] })
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
      const createdCron = logic.createCronFromSchedule(scheduleType, scheduleData, showAlert, hideAlert, alert)

      setCronExpression(createdCron)
    } catch (error) {
      console.error('Failed creating the CRON expression', error)

      showAlert(error.message,
        () => {
          hideAlert({ ...alert, visible: false })
        })
    }
  }

  const hanleLoadCron = () => {
    try {
      const validCron = logic.loadCronIntoSchedule(cronExpression, setScheduleType, setScheduleData)

      if (!validCron) {
        throw new Error('The CRON expression is not valid')
      } else {
        showAlert('The CRON expression is valid',
          () => {
            hideAlert({ ...alert, visible: false })
          })
      }
    } catch (error) {
      console.error('Failed loading the CRON expression', error)

      showAlert('Invalid CRON expression. Check the format!',
        () => {
          hideAlert({ ...alert, visible: false })
        })
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
            <textarea value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} className='w-full border rounded-xl bg-neutral-300 bg-rounded-lg text-black text-2xl text-center px-3 py-2 h-24' />
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
