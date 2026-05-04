import TimeTrack from '../models/TimeTrack.js'
import Employee  from '../models/Employee.js'

const getTodayDate = () => {
  const d = new Date()
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

const calcTotalMinutes = (punches) => {
  return punches.reduce((total, punch) => {
    if (!punch.punchIn || !punch.punchOut) return total
    const diff = Math.floor(
      (new Date(punch.punchOut) - new Date(punch.punchIn)) / 60000
    )
    return total + diff
  }, 0)
}

export const clockIn = async (req, res) => {
  try {
    const { employeeId } = req.body
    const today = getTodayDate()

    console.log(' Employee:', employeeId, '| Date:', today)

    let record = await TimeTrack.findOne({ employeeId, date: today })

    if (record) {
      const lastPunch = record.punches[record.punches.length - 1]

      if (lastPunch && !lastPunch.punchOut) {
        return res.status(400).json({
          message: 'Already punched in! Please punch out first.'
        })
      }

      record.punches.push({ punchIn: new Date() })
      await record.save()

    } else {
      record = await TimeTrack.create({
        employeeId,
        date:    today,
        clockIn: new Date(),
        punches: [{ punchIn: new Date() }]
      })

    }

    res.json(record)

  } catch (err) {
    console.error('error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const clockOut = async (req, res) => {
  try {
    const { employeeId, isFinal = false } = req.body
    const today = getTodayDate()


    const record = await TimeTrack.findOne({ employeeId, date: today })

    if (!record) {
      return res.status(400).json({
        message: 'No clock-in found for today! Please punch in first.'
      })
    }

    const lastPunch = record.punches[record.punches.length - 1]

    if (!lastPunch || lastPunch.punchOut) {
      return res.status(400).json({
        message: 'Not punched in! Please punch in first.'
      })
    }

    record.punches[record.punches.length - 1].punchOut = new Date()
    record.totalMinutes = calcTotalMinutes(record.punches)

    if (isFinal) {
      record.clockOut = new Date()
    } else {
      console.log('Total :', record.totalMinutes, 'mins')
    }

    await record.save()
    res.json(record)

  } catch (err) {
    console.error('error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getAllTime = async (req, res) => {
  try {
    const today = getTodayDate()

    console.log('records — Date:', today)

    const employees = await Employee.find().select('-password')

    const result = await Promise.all(employees.map(async (emp) => {
      const record = await TimeTrack.findOne({
        employeeId: emp._id,
        date: today
      })

      let status = 'Not Started'
      if (record && record.punches.length > 0) {
        const lastPunch = record.punches[record.punches.length - 1]
        if (lastPunch && !lastPunch.punchOut) status = 'Working'
        else if (record.clockOut)             status = 'Completed'
        else                                  status = 'On Break'
      }

      const totalMins = record ? calcTotalMinutes(record.punches) : 0
      const h = Math.floor(totalMins / 60)
      const m = totalMins % 60

      return {
        employee: emp,
        record,
        status,
        totalTime: record ? `${h}h ${m}m` : '—',
        punchCount: record ? record.punches.length : 0,
        clockIn: record?.clockIn  || null,
        clockOut: record?.clockOut || null,
      }
    }))

    res.json(result)

  } catch (err) {
    console.error(' error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getHistory = async (req, res) => {
  try {

    const records = await TimeTrack.find({
      employeeId: req.params.id
    }).sort({ createdAt: -1 })

    res.json(records)

  } catch (err) {
    console.error('error:', err.message)
    res.status(500).json({ message: err.message })
  }
}