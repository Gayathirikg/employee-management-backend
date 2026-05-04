import bcrypt   from 'bcryptjs'
import Employee from '../models/Employee.js'

export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, payroll, experience, joinDate } = req.body

    const hashed = await bcrypt.hash(password, 10)

    const emp = await Employee.create({
      name, email,
      password:   hashed,
      payroll,
      experience,
      joinDate: joinDate ? new Date(joinDate) : new Date()
    })

    res.status(201).json(emp)

  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getEmployees = async (req, res) => {
  try {
    const {
      search = '', page = 1, limit = 5,
      sort = 'name', minPay, maxPay, minExp, maxExp
    } = req.query


    const query = {
      $or: [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    if (minPay || maxPay)
      query.payroll = { $gte: Number(minPay) || 0, $lte: Number(maxPay) || 999999 }
    if (minExp || maxExp)
      query.experience = { $gte: Number(minExp) || 0, $lte: Number(maxExp) || 99 }

    const total= await Employee.countDocuments(query)
    const employees = await Employee.find(query)
      .select('-password')
      .sort(sort === 'date' ? { createdAt: -1 } : { name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ employees, total, page: Number(page), pages: Math.ceil(total / limit) })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).select('-password')
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    res.json(emp)

  } catch (err) {
    console.error('error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const updateEmployee = async (req, res) => {
  try {

    const emp = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password')

    res.json(emp)

  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const deleteEmployee = async (req, res) => {
  try {

    await Employee.findByIdAndDelete(req.params.id)

    res.json({ message: 'Employee deleted successfully' })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}