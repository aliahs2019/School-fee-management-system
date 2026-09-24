// Store all students
let students = [];
let editingStudentId = null;

// Get all navigation links
const navigationLinks = document.querySelectorAll(".nav-link");

// Get all application sections
const sections = document.querySelectorAll(".content-section");

// Get the Add Student button
const addStudentButton = document.getElementById("addStudentBtn");

const recordPaymentButton = document.getElementById("recordPaymentBtn");

// Get the student form
const studentForm = document.getElementById("studentForm");

// Get the Add Student modal
const addStudentModal = new bootstrap.Modal(
  document.getElementById("addStudentModal"),
);

// Navigation
navigationLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    
    // Get the section name
    const sectionName = link.getAttribute("data-section");
    
    // Hide all sections
    sections.forEach(function (section) {
      section.classList.add("d-none");
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName + "-section");
    
    if (selectedSection) {
      selectedSection.classList.remove("d-none");
    }
    
    // If Fee Records is selected,
    // update the student dropdown
    if (sectionName === "fees") {
      populateFeeStudents();
    }
    
    // If Payment History is selected,
    // display payment history
    if (sectionName === "history") {
      displayPaymentHistory();
    }
    
    // If Dashboard is selected,
    // display recent payments
    if (sectionName === "dashboard") {
      displayRecentPayments();
    }
    
    // If Receipts is selected,
    // update the payment dropdown
    if (sectionName === "receipts") {
      populateReceiptPayments();
    }
    
    // Remove active class from all links
    navigationLinks.forEach(function (navLink) {
      navLink.classList.remove("active");
    });
    
    recordPaymentButton.addEventListener("click", function () {
      const feesLink = document.querySelector('[data-section="fees"]');
      
      feesLink.click();
    });
    
    // Make clicked link active
    link.classList.add("active");
  });
});

// Open Add Student modal
addStudentButton.addEventListener("click", function () {
  // Make sure we are adding a new student
  editingStudentId = null;
  
  // Clear the form
  studentForm.reset();
  
  // Open modal
  addStudentModal.show();
});

// Student form submission
studentForm.addEventListener("submit", function (event) {
  // Prevent page refresh
  event.preventDefault();
  
  // Get values from the form
  const studentId = document.getElementById("studentId").value;
  const studentName = document.getElementById("studentName").value;
  const fatherName = document.getElementById("fatherName").value;
  const studentClass = document.getElementById("studentClass").value;
  const rollNumber = document.getElementById("rollNumber").value;
  const contactNumber = document.getElementById("contactNumber").value;
  const monthlyFee = document.getElementById("monthlyFee").value;
  
  const duplicateStudent = students.some(function (existingStudent) {
    return (
      String(existingStudent.id).toLowerCase() ===
      String(studentId).toLowerCase() &&
      existingStudent.id !== editingStudentId
    );
  });
  
  if (duplicateStudent) {
    alert("A student with this ID already exists.");
    return;
  }
  
  // Create student object
  const student = {
    id: studentId,
    name: studentName,
    fatherName: fatherName,
    className: studentClass,
    rollNumber: rollNumber,
    contact: contactNumber,
    monthlyFee: monthlyFee,
  };
  
  // Check whether we are adding or editing
  if (editingStudentId === null) {
    // Add new student
    students.push(student);
  } else {
    // Update existing student
    students = students.map(function (existingStudent) {
      if (existingStudent.id === editingStudentId) {
        return student;
      }
      
      return existingStudent;
    });
    
    // Reset editing mode
    editingStudentId = null;
  }
  
  // Update Students table
  displayStudents();
  
  // Update Fee Records student dropdown
  populateFeeStudents();
  
  // Update Dashboard statistics
  updateDashboard();
  
  // Save students to Local Storage
  localStorage.setItem("students", JSON.stringify(students));
  
  // Close modal
  addStudentModal.hide();
  
  // Clear form
  studentForm.reset();
});

// Display students in the table
function displayStudents(studentList = students) {
  const studentsTableBody = document.getElementById("studentsTableBody");
  
  // Clear existing rows
  studentsTableBody.innerHTML = "";
  
  if (studentList.length === 0) {
    studentsTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-muted py-4">
                No students found. Add a student to get started.
            </td>
        </tr>
    `;
    return;
  }
  
  // Add each student to table
  studentList.forEach(function (student) {
    const row = document.createElement("tr");
    
    row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.className}</td>
            <td>${student.rollNumber}</td>
            <td>Rs. ${student.monthlyFee}</td>
        
            <td>
                <button
                    class="btn btn-sm btn-outline-primary edit-btn">
                    Edit
                </button>
        
                <button
                    class="btn btn-sm btn-outline-danger delete-btn">
                    Delete
                </button>
            </td>
        `;
    
    // Add row to table
    studentsTableBody.appendChild(row);
    
    // Delete button
    const deleteButton = row.querySelector(".delete-btn");
    
    deleteButton.addEventListener("click", function () {
      deleteStudent(student.id);
    });
    
    // Edit button
    const editButton = row.querySelector(".edit-btn");
    
    editButton.addEventListener("click", function () {
      // Store ID of student being edited
      editingStudentId = student.id;
      
      // Fill form with existing student data
      document.getElementById("studentId").value = student.id;
      
      document.getElementById("studentName").value = student.name;
      
      document.getElementById("fatherName").value = student.fatherName;
      
      document.getElementById("studentClass").value = student.className;
      
      document.getElementById("rollNumber").value = student.rollNumber;
      
      document.getElementById("contactNumber").value = student.contact;
      
      document.getElementById("monthlyFee").value = student.monthlyFee;
      
      // Open modal
      addStudentModal.show();
    });
  });
}

// Delete student
function deleteStudent(studentId) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this student?",
  );
  
  if (!confirmDelete) {
    return;
  }
  
  students = students.filter(function (student) {
    return String(student.id) !== String(studentId);
  });
  
  displayStudents();
  populateFeeStudents();
  
  localStorage.setItem("students", JSON.stringify(students));
  
  updateDashboard();
}

// Populate Fee Records student dropdown
function populateFeeStudents() {
  const feeStudent = document.getElementById("feeStudent");
  
  // Make sure the dropdown exists
  if (!feeStudent) {
    return;
  }
  
  // Clear existing options
  feeStudent.innerHTML = `
        <option value="">
            Select a student
        </option>
    `;
  
  // Add students to dropdown
  students.forEach(function (student) {
    const option = document.createElement("option");
    
    // Store student ID
    option.value = student.id;
    
    // Show student name
    option.textContent = student.name;
    
    // Add option to dropdown
    feeStudent.appendChild(option);
  });
}

const feeStudentSelect = document.getElementById("feeStudent");

feeStudentSelect.addEventListener("change", function () {
  const selectedStudent = students.find(function (student) {
    return String(student.id) === String(feeStudentSelect.value);
  });
  
  if (selectedStudent) {
    document.getElementById("feeAmount").value = selectedStudent.monthlyFee;
  } else {
    document.getElementById("feeAmount").value = "";
  }
});

// Load students from Local Storage
const savedStudents = localStorage.getItem("students");

if (savedStudents) {
  students = JSON.parse(savedStudents);
  
  displayStudents();
  
  populateFeeStudents();
}

// Student Search
const studentSearch = document.getElementById("studentSearch");

studentSearch.addEventListener("input", function () {
  // Get search text
  const searchText = studentSearch.value.toLowerCase();
  
  // Filter students by name
  const filteredStudents = students.filter(function (student) {
    return student.name.toLowerCase().includes(searchText);
  });
  
  // Display filtered students
  displayStudents(filteredStudents);
});

// Store all fee records
let feeRecords = [];

// Get Record Fee button
const saveFeeButton = document.getElementById("saveFeeBtn");

// Record Fee
saveFeeButton.addEventListener("click", function () {
  // Get values from the form
  const studentId = document.getElementById("feeStudent").value;
  const feeMonth = document.getElementById("feeMonth").value;
  const feeAmount = document.getElementById("feeAmount").value;
  const paymentDate = document.getElementById("paymentDate").value;
  const feeStatus = document.getElementById("feeStatus").value;
  
  // Check required fields
  if (
    studentId === "" ||
    feeMonth === "" ||
    feeAmount === "" ||
    paymentDate === ""
  ) {
    alert("Please fill in all fee details.");
    return;
  }
  
  const amount = Number(feeAmount);
  
  if (amount <= 0) {
    alert("Fee amount must be greater than 0.");
    return;
  }
  
  const today = new Date().toISOString().split("T")[0];
  
  if (paymentDate > today) {
    alert("Payment date cannot be in the future.");
    return;
  }
  
  // Find selected student
  const selectedStudent = students.find(function (student) {
    return String(student.id) === String(studentId);
  });
  
  // Make sure student exists
  if (!selectedStudent) {
    alert("Student not found.");
    return;
  }
  
  // Create fee record
  const feeRecord = {
    studentId: selectedStudent.id,
    studentName: selectedStudent.name,
    month: feeMonth,
    amount: feeAmount,
    date: paymentDate,
    status: feeStatus,
  };
  
  // Add fee record
  feeRecords.push(feeRecord);
  
  // Save fee records
  localStorage.setItem("feeRecords", JSON.stringify(feeRecords));
  
  // Display fee records
  displayFeeRecords();
  
  // Update Dashboard statistics
  updateDashboard();
  
  // Update Recent Payments
  displayRecentPayments();
  
  // Clear form
  document.getElementById("feeStudent").value = "";
  document.getElementById("feeMonth").value = "";
  document.getElementById("feeAmount").value = "";
  document.getElementById("paymentDate").value = "";
  document.getElementById("feeStatus").value = "Paid";
  
  alert("Fee record saved successfully.");
});

// Display Fee Records
function displayFeeRecords() {
  const feeTableBody = document.getElementById("feeTableBody");
  
  // Clear table
  feeTableBody.innerHTML = "";
  
  if (feeRecords.length === 0) {
    feeTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-muted py-4">
                No fee records found.
            </td>
        </tr>
    `;
    return;
  }
  
  // Display each record
  feeRecords.forEach(function (fee) {
    const row = document.createElement("tr");
    
    row.innerHTML = `
            <td>${fee.studentName}</td>
            <td>${fee.month}</td>
            <td>Rs. ${fee.amount}</td>
            <td>${fee.date}</td>
            <td>
                <span class="badge ${
    fee.status === "Paid" ? "bg-success" : "bg-warning text-dark"
  }">
                    ${fee.status}
                </span>
            </td>
        `;
  
  feeTableBody.appendChild(row);
});
}


// Load saved Fee Records
const savedFeeRecords =
localStorage.getItem("feeRecords");

if (savedFeeRecords) {
  
  feeRecords = JSON.parse(savedFeeRecords);
  
  displayFeeRecords();
  displayRecentPayments();
  
}

// Display Payment History
function displayPaymentHistory() {
  const historyTableBody = document.getElementById("historyTableBody");
  
  // Clear existing rows
  historyTableBody.innerHTML = "";
  
  // Show message if there are no records
  if (feeRecords.length === 0) {
    historyTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    No payment history found.
                </td>
            </tr>
        `;
    
    return;
  }
  
  // Display all fee records
  feeRecords.forEach(function (fee) {
    const row = document.createElement("tr");
    
    row.innerHTML = `
            <td>${fee.studentName}</td>
            <td>${fee.month}</td>
            <td>Rs. ${fee.amount}</td>
            <td>${fee.date}</td>
            <td>
                <span class="badge ${
    fee.status === "Paid" ? "bg-success" : "bg-warning text-dark"
  }">
                    ${fee.status}
                </span>
            </td>
        `;
  
  historyTableBody.appendChild(row);
});
}

// Populate Receipt Payment dropdown
function populateReceiptPayments() {
  const receiptPayment = document.getElementById("receiptPayment");
  
  // Clear existing options
  receiptPayment.innerHTML = `
    <option value="">
        Select a payment
    </option>
`;
  
  if (feeRecords.length === 0) {
    receiptPayment.innerHTML = `
        <option value="">
            No payments available
        </option>
    `;
    
    return;
  }
  
  // Add fee records to dropdown
  feeRecords.forEach(function (fee, index) {
    const option = document.createElement("option");
    
    // Store payment index
    option.value = index;
    
    // Show payment information
    option.textContent = `${fee.studentName} - ${fee.month} - Rs. ${fee.amount}`;
    
    receiptPayment.appendChild(option);
  });
}

// Generate Receipt
const generateReceiptButton = document.getElementById("generateReceiptBtn");

generateReceiptButton.addEventListener("click", function () {
  // Get selected payment
  const selectedPayment = document.getElementById("receiptPayment").value;
  
  // Check if a payment was selected
  if (selectedPayment === "") {
    alert("Please select a payment first.");
    
    return;
  }
  
  // Get selected fee record
  const fee = feeRecords[selectedPayment];
  
  // Show receipt preview
  document.getElementById("receiptPreview").classList.remove("d-none");
  
  // Generate receipt number
  document.getElementById("receiptNumber").textContent =
  "REC-" + (Number(selectedPayment) + 1).toString().padStart(4, "0");
  
  // Add receipt information
  document.getElementById("receiptDate").textContent = fee.date;
  
  document.getElementById("receiptStudent").textContent = fee.studentName;
  
  document.getElementById("receiptMonth").textContent = fee.month;
  
  document.getElementById("receiptAmount").textContent = "Rs. " + fee.amount;
  
  document.getElementById("receiptStatus").textContent = fee.status;
});

// Print Receipt
const printReceiptButton = document.getElementById("printReceiptBtn");

printReceiptButton.addEventListener("click", function () {
  window.print();
});

// Update Dashboard Statistics
function updateDashboard() {
  // Total students
  document.getElementById("totalStudents").textContent = students.length;
  
  // Total payments
  const today = new Date().toISOString().split("T")[0];
  
  const paymentsToday = feeRecords.filter(function (fee) {
    return fee.date === today;
  });
  
  document.getElementById("totalPayments").textContent = paymentsToday.length;
  
  // Calculate total collected fees
  let totalFees = 0;
  
  feeRecords.forEach(function (fee) {
    if (fee.status === "Paid") {
      totalFees += Number(fee.amount);
    }
  });
  
  // Calculate pending fees
  let pendingFees = 0;
  
  feeRecords.forEach(function (fee) {
    if (fee.status === "Pending") {
      pendingFees += Number(fee.amount);
    }
  });
  
  // Display totals
  document.getElementById("totalFees").textContent = "Rs. " + totalFees;
  
  document.getElementById("pendingFees").textContent = "Rs. " + pendingFees;
}

// Update dashboard when page loads
updateDashboard();

// Display Recent Payments
function displayRecentPayments() {
  const recentPaymentsBody = document.getElementById("recentPaymentsBody");
  
  // Clear existing rows
  recentPaymentsBody.innerHTML = "";
  
  if (feeRecords.length === 0) {
    recentPaymentsBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-muted py-4">
                No recent payments found.
            </td>
        </tr>
    `;
    return;
  }
  
  // Get the latest 5 payments
  const recentPayments = feeRecords.slice(-5).reverse();
  
  // Display payments
  recentPayments.forEach(function (fee) {
    const row = document.createElement("tr");
    
    row.innerHTML = `
            <td>${fee.studentName}</td>
            <td>${fee.month}</td>
            <td>Rs. ${fee.amount}</td>
            <td>${fee.date}</td>
            <td>
                <span class="badge ${
    fee.status === "Paid" ? "bg-success" : "bg-warning text-dark"
  }">
                    ${fee.status}
                </span>
            </td>
        `;
  
  recentPaymentsBody.appendChild(row);
});
}
