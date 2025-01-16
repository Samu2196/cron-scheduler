const loadCronIntoSchedule = (cron, setScheduleType, setScheduleData, showAlert, hideAlert, alert) => {
    try {
        const cronParts = cron.split(' ')

        if (cronParts.length !== 5) throw new Error('CRON is not valid')

        const [minute, hour, dayOfMonth, month, dayOfWeek] = cronParts

        // Every X minutes
        if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            const timeInterval = parseInt(minute.replace('*/', ''), 10)
            setScheduleType('everyXMinutes')
            setScheduleData({ timeInterval })
            return true
        }

        // Specific times in a week
        if (dayOfWeek !== '*' && dayOfMonth === '*' && month === '*') {
            const daysOfWeek = dayOfWeek.split(',').map(Number)

            const times = hour.split(',').map((h, i) => `${h}:${minute.split(',')[i]}`)

            setScheduleType('specificTimesWeek')
            setScheduleData({ times, daysOfWeek })
            return true
        }

        // Specific times every day
        if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            const times = minute.split(',').map((min, i) => {
                const hr = hour.split(',')[i]
                return `${hr}:${min}`
            })

            setScheduleType('specificTimesDay')
            setScheduleData({ times })
            return true
        }

        // Specific days of the month
        if (minute === '*' && hour === '*' && dayOfWeek === '*' && month === '*') {
            const daysOfMonth = dayOfMonth.split(',').map(Number)

            setScheduleType('specificDaysMonth')
            setScheduleData({ daysOfMonth })
            return true

        }

        return false

    } catch (error) {
        console.error('Failed loading the CRON expression', error)

        showAlert('Invalid CRON expression. Check the format!',
            () => {
                hideAlert({ ...alert, visible: false })
            })

        return false
    }
}

export default loadCronIntoSchedule