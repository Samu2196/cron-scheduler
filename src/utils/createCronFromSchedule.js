const createCronFromSchedule = (type, scheduleData) => {
    switch (type) {
        case 'everyXMinutes':

            return `*/${scheduleData.timeInterval} * * * *`

        case 'specificTimesWeek':
            const days = scheduleData.daysOfWeek.join(',')

            if (scheduleData.daysOfWeek.length === 0) throw new Error('Please select at least one day of the week')

            return scheduleData.times.map(time => {
                const [hour, minute] = time.split(':')
                return `${minute} ${hour} * * ${days}`
            }).join(',')

        case 'specificTimesDay':
            const validTimes = scheduleData.times.filter(time => time && time.includes(':'))

            if (scheduleData.times.length === 0) throw new Error('Please select at least one time')

            const minutes = validTimes.map(time => time.split(':')[1]).join(',');
            const hours = validTimes.map(time => time.split(':')[0]).join(',');

            return `${minutes} ${hours} * * *`

        case 'specificDaysMonth':
            const daysOfMonth = scheduleData.daysOfMonth.join(',')

            const validDays = daysOfMonth.split(',')
                .map(day => Number(day))

            if (validDays.every(day => day >= 1 && day <= 31)) return `* * ${daysOfMonth} * *`

            else throw new Error('Numbers must be between 1 and 31')

        default:
            return '* * * * *'
    }
}

export default createCronFromSchedule