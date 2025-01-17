const loadCronIntoSchedule = (cron, setScheduleType, setScheduleData) => {

    if (!cron.trim()) throw new Error('Please enter a CRON expression')

    const cronParts = cron.split(' ')

    if (cronParts.length !== 5) throw new Error('CRON is not valid')

    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronParts

    const validateEachPart = (part, range, allowStar = true) => {
        if (part === '*' && allowStar) return true

        if (part.startsWith('*/')) return !isNaN(parseInt(part.replace('*/', ''), 10))

        return part.split(',').every(p => {
            const num = parseInt(p, 10)
            return !isNaN(num) && num >= range[0] && num <= range[1]
        })
    }

    if (!validateEachPart(minute, [0, 59]) ||
        !validateEachPart(hour, [0, 23]) ||
        !validateEachPart(dayOfMonth, [1, 31]) ||
        !validateEachPart(month, [1, 12]) ||
        !validateEachPart(dayOfWeek, [0, 6])) {
        throw new Error('Cron contains invalid values')
    }

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
}

export default loadCronIntoSchedule