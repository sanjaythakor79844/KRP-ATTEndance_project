# 📋 How to Add Attendance Managers

## Current Manager
- **Name**: Kajol
- **Email**: teamkajolrpaswwan@gmail.com
- **ID**: mgr1

---

## Method 1: Using API (Recommended) ✅

### Add New Manager via API Call

```bash
curl -X POST http://localhost:5000/api/attendance/managers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager Name",
    "email": "manager@example.com",
    "phone": "1234567890"
  }'
```

### Example: Add Multiple Managers

```bash
# Add Manager 1
curl -X POST http://localhost:5000/api/attendance/managers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210"
  }'

# Add Manager 2
curl -X POST http://localhost:5000/api/attendance/managers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Patel",
    "email": "priya@example.com",
    "phone": "9876543211"
  }'
```

### Using PowerShell (Windows)

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/attendance/managers" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"Manager Name","email":"manager@example.com","phone":"1234567890"}'
```

### Using JavaScript/Fetch

```javascript
fetch('http://localhost:5000/api/attendance/managers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Manager Name',
    email: 'manager@example.com',
    phone: '1234567890'
  })
})
.then(res => res.json())
.then(data => console.log('Manager added:', data));
```

---

## Method 2: Edit Code Directly

### Edit `server/services/mongoService.js`

Find the `attendanceManagers` array (around line 31):

```javascript
attendanceManagers: [
    { 
        id: 'mgr1', 
        _id: 'mgr1', 
        name: 'Kajol', 
        email: 'teamkajolrpaswwan@gmail.com', 
        phone: '', 
        role: 'manager', 
        createdAt: new Date().toISOString() 
    }
],
```

### Add New Manager:

```javascript
attendanceManagers: [
    { 
        id: 'mgr1', 
        _id: 'mgr1', 
        name: 'Kajol', 
        email: 'teamkajolrpaswwan@gmail.com', 
        phone: '', 
        role: 'manager', 
        createdAt: new Date().toISOString() 
    },
    { 
        id: 'mgr2', 
        _id: 'mgr2', 
        name: 'Rahul Sharma', 
        email: 'rahul@example.com', 
        phone: '9876543210', 
        role: 'manager', 
        createdAt: new Date().toISOString() 
    }
],
```

**Important**: 
- Each manager needs unique `id` and `_id`
- Use `mgr1`, `mgr2`, `mgr3`, etc.
- Restart server after editing

---

## View All Managers

### API Call
```bash
curl http://localhost:5000/api/attendance/managers
```

### PowerShell
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/attendance/managers" -Method GET
```

### Response Example
```json
{
  "success": true,
  "data": [
    {
      "id": "mgr1",
      "name": "Kajol",
      "email": "teamkajolrpaswwan@gmail.com",
      "phone": "",
      "role": "manager"
    },
    {
      "id": "mgr2",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "9876543210",
      "role": "manager"
    }
  ]
}
```

---

## How Managers Work

### What Managers Can Do:
1. ✅ Receive attendance reminder emails
2. ✅ Mark attendance via email buttons (Present/Absent/Late)
3. ✅ Mark attendance via dashboard
4. ✅ View attendance reports

### Email Flow:
1. System sends reminder to manager's email
2. Email contains list of all students
3. Each student has 3 buttons: Present | Absent | Late
4. Manager clicks button → Attendance marked
5. Student receives confirmation email

### Multiple Managers:
- You can have multiple managers
- Each manager receives the same reminder
- Any manager can mark attendance
- All managers see the same data

---

## Send Reminder to Specific Manager

### Using Manager ID

```bash
curl -X POST http://localhost:5000/api/attendance/send-manager-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "managerId": "mgr1",
    "date": "2026-02-12"
  }'
```

### Send to All Managers (Future Feature)

Currently, you need to send individually to each manager. To send to all:

```bash
# Get all managers
curl http://localhost:5000/api/attendance/managers

# Send to each manager
curl -X POST http://localhost:5000/api/attendance/send-manager-reminder \
  -H "Content-Type: application/json" \
  -d '{"managerId": "mgr1", "date": "2026-02-12"}'

curl -X POST http://localhost:5000/api/attendance/send-manager-reminder \
  -H "Content-Type: application/json" \
  -d '{"managerId": "mgr2", "date": "2026-02-12"}'
```

---

## Testing

### Test New Manager

1. **Add Manager**
```bash
curl -X POST http://localhost:5000/api/attendance/managers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Manager",
    "email": "your-test-email@gmail.com",
    "phone": "1234567890"
  }'
```

2. **Get Manager ID from Response**
```json
{
  "success": true,
  "data": {
    "id": "mgr1708512345678",
    "name": "Test Manager",
    "email": "your-test-email@gmail.com"
  }
}
```

3. **Send Test Reminder**
```bash
curl -X POST http://localhost:5000/api/attendance/send-manager-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "managerId": "mgr1708512345678",
    "date": "2026-02-12"
  }'
```

4. **Check Email**
- Open your-test-email@gmail.com
- You should receive attendance reminder
- Click any button to test

---

## Troubleshooting

### Manager Not Receiving Emails
1. Check Gmail is connected
2. Verify manager email is correct
3. Check spam folder
4. Verify manager ID is correct

### API Returns Error
1. Check server is running
2. Verify JSON format is correct
3. Check server logs for errors
4. Ensure name and email are provided

### Manager Not in Dropdown
1. Refresh the page
2. Check API response: `GET /api/attendance/managers`
3. Verify manager was added successfully
4. Check browser console for errors

---

## Quick Reference

### Add Manager
```bash
POST /api/attendance/managers
Body: {"name": "Name", "email": "email@example.com", "phone": "1234567890"}
```

### Get All Managers
```bash
GET /api/attendance/managers
```

### Send Reminder
```bash
POST /api/attendance/send-manager-reminder
Body: {"managerId": "mgr1", "date": "2026-02-12"}
```

---

## Future Enhancement Ideas

- Dashboard UI to add/edit/delete managers
- Send reminder to all managers at once
- Manager roles and permissions
- Manager activity logs
- Manager performance reports

---

**Last Updated**: February 11, 2026
**Feature**: Attendance Manager Management
**Status**: API Ready ✅

