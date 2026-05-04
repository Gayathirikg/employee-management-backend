import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import Employee from '../models/Employee.js'
// admin
const ADMIN = { email: 'admin@gmail.com', password: 'admin123' }

export const adminLogin = async (req, res) => {
  const { email, password } = req.body

  console.log('Admin login attempt:', email)

  if (email !== ADMIN.email || password !== ADMIN.password) {
    return res.status(401).json({ message: 'Invalid admin ' })
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' })

  console.log('Admin login success:', email)
  res.json({ token, role: 'admin' })
}
// employee
export const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body


    const employee = await Employee.findOne({ email })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    const isMatch = await bcrypt.compare(password, employee.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' })
    }

    const token = jwt.sign(
      { id: employee._id, role: 'employee' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    console.log('Employee login success:', email)
    res.json({ token, employee })

  } catch (err) {
    console.error(' Employee login error:', err.message)
    res.status(500).json({ message: err.message })
  }
}