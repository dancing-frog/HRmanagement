const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/hr_management_system');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Helper function to get random date within range
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to get random time in working hours
const getRandomWorkTime = (baseDate, isCheckIn = true) => {
  const date = new Date(baseDate);
  if (isCheckIn) {
    // Check-in between 8:30 AM and 10:00 AM
    date.setHours(8 + Math.random() * 1.5, Math.random() * 60, 0, 0);
  } else {
    // Check-out between 5:30 PM and 7:30 PM  
    date.setHours(17.5 + Math.random() * 2, Math.random() * 60, 0, 0);
  }
  return date;
};

// Users and Employees data
const usersData = [
  // Admin
  {
    firstName: 'Rajesh', lastName: 'Kumar', email: 'admin@dayflow.com', role: 'admin',
    department: 'Administration', designation: 'System Administrator', phone: '+91-9876543001'
  },
  
  // HR Team
  {
    firstName: 'Priya', lastName: 'Sharma', email: 'priya.hr@dayflow.com', role: 'hr',
    department: 'Human Resources', designation: 'HR Manager', phone: '+91-9876543002'
  },
  {
    firstName: 'Vikram', lastName: 'Singh', email: 'vikram.hr@dayflow.com', role: 'hr',
    department: 'Human Resources', designation: 'HR Business Partner', phone: '+91-9876543003'
  },

  // Engineering Team
  {
    firstName: 'Arjun', lastName: 'Patel', email: 'arjun.patel@dayflow.com', role: 'employee',
    department: 'Engineering', designation: 'Senior Software Engineer', phone: '+91-9876543101'
  },
  {
    firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@dayflow.com', role: 'employee',
    department: 'Engineering', designation: 'Frontend Developer', phone: '+91-9876543102'
  },
  {
    firstName: 'Karthik', lastName: 'Nair', email: 'karthik.nair@dayflow.com', role: 'employee',
    department: 'Engineering', designation: 'Backend Developer', phone: '+91-9876543103'
  },
  {
    firstName: 'Meera', lastName: 'Gupta', email: 'meera.gupta@dayflow.com', role: 'employee',
    department: 'Engineering', designation: 'DevOps Engineer', phone: '+91-9876543104'
  },
  {
    firstName: 'Rohit', lastName: 'Agarwal', email: 'rohit.agarwal@dayflow.com', role: 'employee',
    department: 'Engineering', designation: 'Full Stack Developer', phone: '+91-9876543105'
  },
  {
    firstName: 'Ananya', lastName: 'Iyer', email: 'ananya.iyer@dayflow.com', role: 'employee',
    department: 'Engineering', designation: 'Software Engineer', phone: '+91-9876543106'
  },

  // Product Team
  {
    firstName: 'Rahul', lastName: 'Verma', email: 'rahul.verma@dayflow.com', role: 'employee',
    department: 'Product', designation: 'Product Manager', phone: '+91-9876543201'
  },
  {
    firstName: 'Kavya', lastName: 'Menon', email: 'kavya.menon@dayflow.com', role: 'employee',
    department: 'Product', designation: 'Product Analyst', phone: '+91-9876543202'
  },
  {
    firstName: 'Siddharth', lastName: 'Joshi', email: 'siddharth.joshi@dayflow.com', role: 'employee',
    department: 'Product', designation: 'Product Owner', phone: '+91-9876543203'
  },

  // Design Team
  {
    firstName: 'Aditi', lastName: 'Bajaj', email: 'aditi.bajaj@dayflow.com', role: 'employee',
    department: 'Design', designation: 'UX Designer', phone: '+91-9876543301'
  },
  {
    firstName: 'Varun', lastName: 'Malhotra', email: 'varun.malhotra@dayflow.com', role: 'employee',
    department: 'Design', designation: 'UI Designer', phone: '+91-9876543302'
  },
  {
    firstName: 'Ishita', lastName: 'Kapoor', email: 'ishita.kapoor@dayflow.com', role: 'employee',
    department: 'Design', designation: 'Graphic Designer', phone: '+91-9876543303'
  },

  // Marketing Team
  {
    firstName: 'Nitin', lastName: 'Shah', email: 'nitin.shah@dayflow.com', role: 'employee',
    department: 'Marketing', designation: 'Marketing Manager', phone: '+91-9876543401'
  },
  {
    firstName: 'Riya', lastName: 'Chopra', email: 'riya.chopra@dayflow.com', role: 'employee',
    department: 'Marketing', designation: 'Digital Marketing Specialist', phone: '+91-9876543402'
  },
  {
    firstName: 'Aman', lastName: 'Saxena', email: 'aman.saxena@dayflow.com', role: 'employee',
    department: 'Marketing', designation: 'Content Marketing Lead', phone: '+91-9876543403'
  },

  // Sales Team
  {
    firstName: 'Deepak', lastName: 'Bansal', email: 'deepak.bansal@dayflow.com', role: 'employee',
    department: 'Sales', designation: 'Sales Manager', phone: '+91-9876543501'
  },
  {
    firstName: 'Pooja', lastName: 'Mittal', email: 'pooja.mittal@dayflow.com', role: 'employee',
    department: 'Sales', designation: 'Sales Executive', phone: '+91-9876543502'
  },
  {
    firstName: 'Ajay', lastName: 'Tiwari', email: 'ajay.tiwari@dayflow.com', role: 'employee',
    department: 'Sales', designation: 'Business Development Executive', phone: '+91-9876543503'
  },

  // Finance Team
  {
    firstName: 'Sunita', lastName: 'Rao', email: 'sunita.rao@dayflow.com', role: 'employee',
    department: 'Finance', designation: 'Finance Manager', phone: '+91-9876543601'
  },
  {
    firstName: 'Manish', lastName: 'Jain', email: 'manish.jain@dayflow.com', role: 'employee',
    department: 'Finance', designation: 'Senior Accountant', phone: '+91-9876543602'
  },
  {
    firstName: 'Divya', lastName: 'Srinivasan', email: 'divya.srinivasan@dayflow.com', role: 'employee',
    department: 'Finance', designation: 'Financial Analyst', phone: '+91-9876543603'
  },

  // Operations Team
  {
    firstName: 'Abhishek', lastName: 'Pandey', email: 'abhishek.pandey@dayflow.com', role: 'employee',
    department: 'Operations', designation: 'Operations Manager', phone: '+91-9876543701'
  },
  {
    firstName: 'Shruti', lastName: 'Bhatt', email: 'shruti.bhatt@dayflow.com', role: 'employee',
    department: 'Operations', designation: 'Operations Coordinator', phone: '+91-9876543702'
  },

  // Analytics Team
  {
    firstName: 'Harsh', lastName: 'Goyal', email: 'harsh.goyal@dayflow.com', role: 'employee',
    department: 'Analytics', designation: 'Data Analyst', phone: '+91-9876543801'
  },
  {
    firstName: 'Tanvi', lastName: 'Desai', email: 'tanvi.desai@dayflow.com', role: 'employee',
    department: 'Analytics', designation: 'Business Intelligence Analyst', phone: '+91-9876543802'
  }
];

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Create users and employees
const createUsersAndEmployees = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const employeeId = `EMP${(1001 + i).toString()}`;
      
      // Create user
      const user = new User({
        employeeId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        department: userData.department
      });
      
      const savedUser = await user.save();
      
      // Create employee
      const joinDate = getRandomDate(
        new Date(2023, 0, 1),
        new Date(2024, 11, 1)
      );
      
      // Generate salary based on role and department (in INR)
      let monthlyWage = 50000;
      if (userData.role === 'admin') monthlyWage = 150000;
      else if (userData.role === 'hr') monthlyWage = 80000;
      else if (userData.department === 'Engineering') monthlyWage = 70000 + Math.random() * 50000;
      else if (userData.department === 'Product') monthlyWage = 65000 + Math.random() * 40000;
      else if (userData.department === 'Design') monthlyWage = 50000 + Math.random() * 35000;
      else if (userData.department === 'Marketing') monthlyWage = 45000 + Math.random() * 30000;
      else if (['Finance', 'Operations'].includes(userData.department)) monthlyWage = 55000 + Math.random() * 25000;
      else monthlyWage = 40000 + Math.random() * 20000;
      
      monthlyWage = Math.round(monthlyWage);
      
      const employee = new Employee({
        user: savedUser._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        employeeId,
        department: userData.department,
        designation: userData.designation,
        role: userData.role,
        joinDate,
        dateOfBirth: getRandomDate(new Date(1985, 0, 1), new Date(2000, 11, 31)),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} ${['MG Road', 'Park Street', 'Brigade Road', 'Commercial Street', 'Linking Road'][Math.floor(Math.random() * 5)]}`,
          city: ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Gurgaon'][Math.floor(Math.random() * 8)],
          state: ['Maharashtra', 'Karnataka', 'Delhi', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Haryana'][Math.floor(Math.random() * 7)],
          zipCode: Math.floor(Math.random() * 900000) + 100000,
          country: 'India'
        },
        maritalStatus: ['Single', 'Married', 'Divorced'][Math.floor(Math.random() * 3)],
        nationality: 'Indian',
        salary: {
          monthlyWage,
          yearlyWage: monthlyWage * 12,
          currency: 'INR',
          wageType: 'Fixed',
          components: {
            basicSalary: { percentage: 50, amount: monthlyWage * 0.5 },
            houseRentAllowance: { percentage: 50, amount: monthlyWage * 0.5 * 0.5 },
            standardAllowance: { percentage: 16.67, amount: monthlyWage * 0.5 * 0.1667 },
            performanceBonus: { percentage: 8.33, amount: monthlyWage * 0.5 * 0.0833 },
            leaveTravelAllowance: { percentage: 8.33, amount: monthlyWage * 0.5 * 0.0833 },
            fixedAllowance: { percentage: 11.67, amount: monthlyWage * 0.5 * 0.1167 }
          },
          deductions: {
            providentFund: {
              employee: { percentage: 12, amount: monthlyWage * 0.5 * 0.12 },
              employer: { percentage: 12, amount: monthlyWage * 0.5 * 0.12 }
            },
            professionalTax: { amount: 200 }
          },
          grossSalary: monthlyWage,
          totalDeductions: (monthlyWage * 0.5 * 0.12) + 200,
          netSalary: monthlyWage - ((monthlyWage * 0.5 * 0.12) + 200)
        },
        bankDetails: {
          accountNumber: Math.floor(Math.random() * 90000000000) + 10000000000,
          bankName: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'IndusInd Bank'][Math.floor(Math.random() * 6)],
          ifscCode: 'SBIN000' + Math.floor(Math.random() * 9000) + 1000,
          panNo: 'ABCDE' + Math.floor(Math.random() * 90000) + 10000 + 'F',
          accountHolderName: `${userData.firstName} ${userData.lastName}`
        }
      });
      
      await employee.save();
      console.log(`✅ Created user and employee: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }
  } catch (error) {
    console.error('Error creating users and employees:', error);
  }
};

// Generate attendance records
const generateAttendanceRecords = async () => {
  try {
    const employees = await Employee.find({});
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    for (const employee of employees) {
      // Generate records for last 30 days
      for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          continue;
        }
        
        // 90% chance of attendance
        const isPresent = Math.random() > 0.1;
        
        if (isPresent) {
          const checkInTime = getRandomWorkTime(currentDate, true);
          const checkOutTime = getRandomWorkTime(currentDate, false);
          const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
          
          const attendance = new Attendance({
            employee: employee._id,
            date: currentDate,
            checkIn: {
              time: checkInTime,
              location: 'Office',
              method: 'web'
            },
            checkOut: {
              time: checkOutTime,
              location: 'Office', 
              method: 'web'
            },
            status: checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30) ? 'late' : 'present',
            totalHours: Math.round(totalHours * 100) / 100,
            overtimeHours: totalHours > 8 ? totalHours - 8 : 0,
            breakDuration: 30 + Math.random() * 30 // 30-60 minutes
          });
          
          await attendance.save();
        }
      }
    }
    console.log('✅ Generated attendance records for all employees');
  } catch (error) {
    console.error('Error generating attendance records:', error);
  }
};

// Generate leave requests
const generateLeaveRequests = async () => {
  try {
    const employees = await Employee.find({});
    const leaveTypes = ['paid', 'sick', 'personal', 'vacation', 'unpaid'];
    const statuses = ['pending', 'approved', 'rejected'];
    const today = new Date();
    
    for (const employee of employees) {
      // Generate 2-5 leave requests per employee
      const numLeaves = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < numLeaves; i++) {
        const startDate = getRandomDate(
          new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000)), // 90 days ago
          new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))  // 30 days ahead
        );
        
        const totalDays = Math.floor(Math.random() * 5) + 1; // 1-5 days
        const endDate = new Date(startDate.getTime() + ((totalDays - 1) * 24 * 60 * 60 * 1000));
        
        const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const leave = new Leave({
          employee: employee._id,
          leaveType,
          title: `${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} Leave`,
          reason: [
            'Personal commitment',
            'Medical checkup',
            'Family function',
            'Festival celebration',
            'Home emergency',
            'Wedding ceremony',
            'Religious observance',
            'Child care'
          ][Math.floor(Math.random() * 8)],
          startDate,
          endDate,
          totalDays,
          isHalfDay: totalDays === 1 && Math.random() > 0.7,
          status,
          appliedDate: getRandomDate(
            new Date(startDate.getTime() - (14 * 24 * 60 * 60 * 1000)),
            startDate
          ),
          approvedBy: status === 'approved' ? employees.find(emp => emp.role === 'hr')?._id : null,
          approvedDate: status === 'approved' ? getRandomDate(startDate, new Date()) : null
        });
        
        await leave.save();
      }
    }
    console.log('✅ Generated leave requests for all employees');
  } catch (error) {
    console.error('Error generating leave requests:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    await connectDB();
    await clearDatabase();
    
    console.log('\n👥 Creating users and employees...');
    await createUsersAndEmployees();
    
    console.log('\n📅 Generating attendance records...');
    await generateAttendanceRecords();
    
    console.log('\n🏖️ Generating leave requests...');
    await generateLeaveRequests();
    
    console.log('\n✨ Database seeding completed successfully!\n');
    
    // Print summary
    const userCount = await User.countDocuments();
    const employeeCount = await Employee.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    const leaveCount = await Leave.countDocuments();
    
    console.log('📊 SEEDING SUMMARY:');
    console.log('===================');
    console.log(`👤 Users: ${userCount}`);
    console.log(`👥 Employees: ${employeeCount}`);
    console.log(`📅 Attendance Records: ${attendanceCount}`);
    console.log(`🏖️ Leave Requests: ${leaveCount}\n`);
    
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('=====================');
    console.log('Admin: admin@dayflow.com / password123');
    console.log('HR Manager: priya.hr@dayflow.com / password123');
    console.log('HR Partner: vikram.hr@dayflow.com / password123');
    console.log('Employee Examples:');
    console.log('  - arjun.patel@dayflow.com / password123 (Engineering)');
    console.log('  - sneha.reddy@dayflow.com / password123 (Engineering)');
    console.log('  - rahul.verma@dayflow.com / password123 (Product)');
    console.log('  - aditi.bajaj@dayflow.com / password123 (Design)');
    console.log('  - nitin.shah@dayflow.com / password123 (Marketing)');
    console.log('\n🎉 Happy testing!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
};

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };