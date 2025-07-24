// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBpBNXPgfC8oKwH_hcESZd1OSjxkuZ3qP8",
  authDomain: "cmanagementweb-53319.firebaseapp.com",
  projectId: "cmanagementweb-53319",
  storageBucket: "cmanagementweb-53319.firebasestorage.app",
  messagingSenderId: "98416562035",
  appId: "1:98416562035:web:f083d012b694d971d17f06",
  measurementId: "G-NG15WBG6EH"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM elements
const studentsTableBody = document.getElementById('studentsTableBody');
const loadingSpinner = document.getElementById('loadingSpinner');
const noStudents = document.getElementById('noStudents');
const searchInput = document.getElementById('searchInput');
const gradeFilter = document.getElementById('gradeFilter');
const streamFilter = document.getElementById('streamFilter');
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const studentToDeleteName = document.getElementById('studentToDeleteName');
const confirmDelete = document.getElementById('confirmDelete');

// State variables
let allStudents = [];
let currentCollection = 'students_11th';
let studentToDeleteId = null;

// Initialize the page
function init() {
    setupEventListeners();
    checkAuthState();
}

// Set up event listeners
function setupEventListeners() {
    // Automatic search with debounce
    searchInput.addEventListener('input', debounce(filterStudents, 300));
    
    // Filter changes
    gradeFilter.addEventListener('change', handleGradeFilterChange);
    streamFilter.addEventListener('change', filterStudents);
    
    // Delete confirmation
    confirmDelete.addEventListener('click', deleteStudent);
}

// Debounce function for search
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            loadAllStudents();
        } else {
            signInAdmin();
        }
    });
}

// Sign in admin
function signInAdmin() {
    auth.signInWithEmailAndPassword("admin@example.com", "adminpassword")
        .then(() => {
            loadAllStudents();
        })
        .catch(error => {
            console.error("Authentication error:", error);
            showError("Authentication failed. Please check console for details.");
        });
}

// Load all students from both collections
function loadAllStudents() {
    showLoading(true);
    allStudents = [];
    
    const promises = [
        db.collection('students_11th').get().then(snapshot => {
            snapshot.forEach(doc => {
                allStudents.push({
                    id: doc.id,
                    ...doc.data(),
                    grade: '11'
                });
            });
        }),
        db.collection('students_12th').get().then(snapshot => {
            snapshot.forEach(doc => {
                allStudents.push({
                    id: doc.id,
                    ...doc.data(),
                    grade: '12'
                });
            });
        })
    ];
    
    Promise.all(promises)
        .then(() => {
            displayStudents(allStudents);
            showLoading(false);
        })
        .catch(error => {
            console.error("Error loading students:", error);
            showError("Failed to load students. Please try again.");
            showLoading(false);
        });
}

// Display students in table
function displayStudents(students) {
    studentsTableBody.innerHTML = '';
    
    if (students.length === 0) {
        noStudents.style.display = 'block';
        return;
    }
    
    noStudents.style.display = 'none';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${highlightMatches(student.fullName)}</strong>
                ${student.email ? `<br><small class="text-muted">${highlightMatches(student.email)}</small>` : ''}
            </td>
            <td>${highlightMatches(student.phone)}</td>
            <td><span class="badge bg-primary grade-badge">${student.grade}th</span></td>
            <td>${highlightMatches(formatStream(student.stream))}</td>
            <td>${highlightMatches(student.address)}</td>
            <td>
                ${student.parentName}<br>
                <small class="text-muted">${student.parentPhone}</small>
            </td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="prepareDelete('${student.id}', '${student.fullName}', '${student.grade}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;
        studentsTableBody.appendChild(row);
    });
}

// Highlight search matches
function highlightMatches(text) {
    if (!searchInput.value) return text;
    
    const searchTerm = searchInput.value.toLowerCase();
    const str = text ? text.toString() : '';
    
    if (str.toLowerCase().includes(searchTerm)) {
        const regex = new RegExp(searchTerm, 'gi');
        return str.replace(regex, match => `<span class="highlight">${match}</span>`);
    }
    return str;
}

// Format stream for display
function formatStream(stream) {
    const streamMap = {
        'PCM': 'PCM (Physics, Chemistry, Maths)',
        'PCB': 'PCB (Physics, Chemistry, Biology)',
        'PCMB': 'PCMB (Physics, Chemistry, Maths, Biology)',
        'Commerce': 'Commerce',
        'Arts': 'Arts'
    };
    return streamMap[stream] || stream;
}

// Filter students based on search and filters
function filterStudents() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGrade = gradeFilter.value;
    const selectedStream = streamFilter.value;
    
    const filtered = allStudents.filter(student => {
        // Grade filter
        if (selectedGrade !== 'all' && student.grade !== selectedGrade) {
            return false;
        }
        
        // Stream filter
        if (selectedStream !== 'all' && student.stream !== selectedStream) {
            return false;
        }
        
        // Search term
        if (searchTerm) {
            const searchFields = [
                student.fullName,
                student.phone,
                student.email,
                student.stream,
                student.address,
                student.parentName,
                student.parentPhone
            ].join(' ').toLowerCase();
            
            return searchFields.includes(searchTerm);
        }
        
        return true;
    });
    
    displayStudents(filtered);
}

// Handle grade filter change
function handleGradeFilterChange() {
    const selectedGrade = gradeFilter.value;
    currentCollection = selectedGrade === '12' ? 'students_12th' : 'students_11th';
    filterStudents();
}

// Prepare for deletion
function prepareDelete(id, name, grade) {
    studentToDeleteId = id;
    currentCollection = grade === '12' ? 'students_12th' : 'students_11th';
    studentToDeleteName.textContent = name;
    deleteModal.show();
}

// Delete student
function deleteStudent() {
    deleteModal.hide();
    showLoading(true);
    
    db.collection(currentCollection).doc(studentToDeleteId).delete()
        .then(() => {
            showSuccess("Student deleted successfully");
            loadAllStudents(); // Refresh the entire list
        })
        .catch(error => {
            console.error("Error deleting student:", error);
            showError("Failed to delete student. Please try again.");
            showLoading(false);
        });
}

// UI helper functions
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

function showSuccess(message) {
    alert(message); // Replace with toast if preferred
}

function showError(message) {
    alert(message); // Replace with toast if preferred
}

// Initialize the page
window.prepareDelete = prepareDelete; // Make function available globally
document.addEventListener('DOMContentLoaded', init);