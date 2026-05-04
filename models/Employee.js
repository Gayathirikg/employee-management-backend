import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
   email:{
    type:String,
    required:true,
    unique:true
   },
    password:{
        type:String,
        required:true
    },
     payroll:{
        type:Number,
        required:true
     },
     experience:{
        type:Number,
        required:true
     },
      joinDate:{
        type: Date,
         default: Date.now
         },
},{timestamps:true});

const Employee = mongoose.model("Employee",employeeSchema);

export default Employee;