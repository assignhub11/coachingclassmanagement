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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM elements
const studentForm = document.getElementById('studentForm');
const successToast = new bootstrap.Toast(document.getElementById('successToast'));
const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
const errorMessage = document.getElementById('errorMessage');

// Form submission
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const grade = document.getElementById('grade').value;
    const stream = document.getElementById('stream').value;
    const parentName = document.getElementById('parentName').value;
    const parentPhone = document.getElementById('parentPhone').value;
    
    try {
        // Create student data object
        const studentData = {
            fullName,
            phone,
            email: email || null,
            address,
            stream,
            parentName,
            parentPhone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            attendance: [],
            fees: []
        };
        
        // Determine which collection to use based on grade
        const collectionName = grade === '11' ? 'students_11th' : 'students_12th';
        
        // Add student to Firestore
        await db.collection(collectionName).add(studentData);
        
        // Show success message
        successToast.show();
        
        // Reset form
        studentForm.reset();
        
    } catch (error) {
        console.error("Error adding student: ", error);
        errorMessage.textContent = `Error adding student: ${error.message}`;
        errorToast.show();
    }
});

// Phone number validation
document.getElementById('phone').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
});

document.getElementById('parentPhone').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
});