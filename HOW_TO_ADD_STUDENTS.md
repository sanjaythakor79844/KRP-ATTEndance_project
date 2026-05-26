# 👥 How to Add New Students

## Current Students (15 - Batch A)
1. Dakshi Kocharekar
2. Bhavna
3. Shafaq
4. Sarah
5. Vaibhavi
6. Rishakha
7. Simran
8. Harshi
9. Sangeeta
10. Vrindanti
11. Mayra
12. Kanishka
13. Prachika
14. Aviva
15. Khushi

---

## Method 1: Using Dashboard (Easiest) ✅

### Step-by-Step:

1. **Open Dashboard**
   - Go to: http://localhost:5173
   - Click on **"Students"** in sidebar

2. **Click "Add Student" Button**
   - Top right corner
   - Blue button with "+" icon

3. **Fill Student Details**
   - **Name**: Student's full name (required)
   - **Email**: Student's email address (required for notifications)
   - **Phone**: Student's phone number (optional)
   - **Batch**: Select batch (A, B, C, etc.)
   - **Status**: Active/Inactive

4. **Click "Save"**
   - Student will be added immediately
   - Will appear in students list
   - Can now mark attendance for this student

### Screenshot Guide:
```
Dashboard → Students → Add Student Button → Fill Form → Save
```

---

## Method 2: Using API ✅

### Add Single Student

```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Student Name",
    "email": "student@example.com",
    "phone": "1234567890",
    "batch": "A",
    "status": "active"
  }'
```

### PowerShell (Windows)

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/students" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"Student Name","email":"student@example.com","phone":"1234567890","batch":"A","status":"active"}'
```

### Add Multiple Students (Bulk)

```bash
# Student 1
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Amit Kumar","email":"amit@example.com","phone":"9876543210","batch":"B","status":"active"}'

# Student 2
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Sneha Patel","email":"sneha@example.com","phone":"9876543211","batch":"B","status":"active"}'

# Student 3
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Rohan Sharma","email":"rohan@example.com","phone":"9876543212","batch":"B","status":"active"}'
```

---

## Method 3: Edit Code Directly

### Edit `server/services/mongoService.js`

Find the `students` array in `fallbackData` (around line 13):

```javascript
students: [
    { 
        id: '1', 
        _id: '1', 
        name: 'Dakshi Kocharekar', 
        email: 'dakshikocharekar6@gmail.com', 
        phone: '', 
        assignmentLimit: 5, 
        currentAssignments: 0, 
        status: 'active', 
        batch: 'A', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
    },
    // ... more students
],
```

### Add New Student:

```javascript
{ 
    id: '16', 
    _id: '16', 
    name: 'New Student Name', 
    email: 'newstudent@example.com', 
    phone: '1234567890', 
    assignmentLimit: 5, 
    currentAssignments: 0, 
    status: 'active', 
    batch: 'B', 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
},
```

**Important**: 
- Each student needs unique `id` and `_id`
- Use sequential numbers: '16', '17', '18', etc.
- Restart server after editing

---

## Student Fields Explained

### Required Fields:
- **name**: Student's full name
- **email**: For sending notifications (attendance confirmations, project assignments)
- **status**: 'active' or 'inactive'

### Optional Fields:
- **phone**: Phone number (for future SMS features)
- **batch**: Batch identifier (A, B, C, etc.)
- **assignmentLimit**: Max projects (default: 5)
- **currentAssignments**: Current active projects (default: 0)

### Auto-Generated:
- **id**: Unique identifier
- **createdAt**: Timestamp when added
- **updatedAt**: Last modification timestamp

---

## View All Students

### Dashboard
- Go to **Students** page
- See complete list with:
  - Name
  - Email
  - Phone
  - Batch
  - Status
  - Actions (Edit/Delete)

### API Call
```bash
curl http://localhost:5000/api/students
```

### Response Example
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Dakshi Kocharekar",
      "email": "dakshikocharekar6@gmail.com",
      "phone": "",
      "batch": "A",
      "status": "active",
      "assignmentLimit": 5,
      "currentAssignments": 0
    }
  ]
}
```

---

## Edit Student

### Using Dashboard:
1. Go to **Students** page
2. Click **Edit** icon (✏️) next to student
3. Update details
4. Click **Save**

### Using API:
```bash
curl -X PUT http://localhost:5000/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com",
    "phone": "9999999999",
    "batch": "B",
    "status": "active"
  }'
```

---

## Delete Student

### Using Dashboard:
1. Go to **Students** page
2. Click **Delete** icon (🗑️) next to student
3. Confirm deletion

### Using API:
```bash
curl -X DELETE http://localhost:5000/api/students/1
```

**Warning**: This will permanently delete the student and all their attendance records!

---

## Bulk Import Students (Future Feature)

Currently not available, but you can:

### Option 1: Use API in Loop
Create a script to add multiple students:

```bash
#!/bin/bash
# add-students.sh

students=(
  "Amit Kumar:amit@example.com:9876543210:B"
  "Sneha Patel:sneha@example.com:9876543211:B"
  "Rohan Sharma:rohan@example.com:9876543212:B"
)

for student in "${students[@]}"; do
  IFS=':' read -r name email phone batch <<< "$student"
  curl -X POST http://localhost:5000/api/students \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"email\":\"$email\",\"phone\":\"$phone\",\"batch\":\"$batch\",\"status\":\"active\"}"
  echo ""
done
```

### Option 2: Edit Code
Add all students at once in `mongoService.js` fallback data.

---

## After Adding Students

### What Happens:
1. ✅ Student appears in Students list
2. ✅ Student appears in Attendance dropdown
3. ✅ Can mark attendance for student
4. ✅ Student receives attendance confirmation emails
5. ✅ Can assign projects to student
6. ✅ Student included in broadcast emails

### Test New Student:
1. Add student via dashboard
2. Go to Attendance page
3. Select the new student
4. Mark as Present
5. Check student's email for confirmation

---

## Common Scenarios

### Scenario 1: New Batch Joining
```bash
# Add all Batch B students
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Student 1","email":"student1@example.com","batch":"B","status":"active"}'

curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Student 2","email":"student2@example.com","batch":"B","status":"active"}'
# ... continue for all students
```

### Scenario 2: Student Email Changed
```bash
# Update student email
curl -X PUT http://localhost:5000/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"email":"newemail@example.com"}'
```

### Scenario 3: Student Inactive
```bash
# Mark student as inactive
curl -X PUT http://localhost:5000/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'
```

---

## Troubleshooting

### Student Not Appearing in Dropdown
1. Refresh the page
2. Check student status is 'active'
3. Verify student was added successfully
4. Check browser console for errors

### Student Not Receiving Emails
1. Verify email address is correct
2. Check Gmail is connected
3. Check spam folder
4. Verify student status is 'active'

### Cannot Add Student
1. Check all required fields are filled
2. Verify email format is correct
3. Check server is running
4. Check server logs for errors

---

## Best Practices

### Email Addresses
- ✅ Use valid, working email addresses
- ✅ Test with one student first
- ✅ Verify emails are being received
- ❌ Don't use fake/test emails in production

### Student Names
- ✅ Use full names
- ✅ Consistent formatting
- ✅ Check spelling
- ❌ Don't use nicknames

### Batches
- ✅ Use consistent batch naming (A, B, C or 2024-A, 2024-B)
- ✅ Document batch system
- ✅ Keep it simple

### Status
- ✅ Set to 'active' for current students
- ✅ Set to 'inactive' for alumni/dropouts
- ✅ Inactive students won't appear in dropdowns

---

## Quick Reference

### Add Student (Dashboard)
```
Dashboard → Students → Add Student → Fill Form → Save
```

### Add Student (API)
```bash
POST /api/students
Body: {"name":"Name","email":"email@example.com","phone":"1234567890","batch":"A","status":"active"}
```

### Get All Students
```bash
GET /api/students
```

### Update Student
```bash
PUT /api/students/{id}
Body: {"name":"Updated Name","email":"updated@example.com"}
```

### Delete Student
```bash
DELETE /api/students/{id}
```

---

## Data Persistence Note

⚠️ **Important**: 
- If MongoDB is NOT connected, data is stored in-memory
- Data will be LOST when server restarts
- Connect MongoDB for permanent storage
- See `MONGODB_SETUP.md` for instructions

---

**Last Updated**: February 11, 2026
**Feature**: Student Management
**Status**: Fully Functional ✅

