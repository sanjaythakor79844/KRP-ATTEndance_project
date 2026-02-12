# 📧 Attendance Manager Ko Email Kaise Bheje

## Method 1: Broadcast Component Use Karo (Recommended)

### Steps:
1. **Broadcast** tab pe jao
2. **Subject** mein likho: "Attendance Reminder - [Date]"
3. **Message** mein likho:
   ```
   Dear Attendance Manager,
   
   Please mark today's attendance for all students.
   
   Date: [Today's Date]
   Class: [Class Name]
   
   Login to dashboard: http://localhost:5173
   Go to Attendance tab and mark Present/Absent/Late for each student.
   
   Thank you!
   ```
4. **Select Students** section mein attendance manager ko select karo
   - Sanjay Thakor (sanjaythakor47095@gmail.com)
   - Ya Shyanjali Datta (dattashyanjali81@gmail.com)
5. **Send** button click karo

✅ Email bhej jayega!

---

## Method 2: Direct API Call (For Testing)

### PowerShell se test karo:
```powershell
$body = @{
    subject = "Attendance Reminder"
    message = "Please mark today's attendance"
    studentIds = @("1", "2")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/broadcast" -Method POST -Body $body -ContentType "application/json"
```

---

## Current Attendance System

### Attendance Tab Features:
1. **Mark Attendance** - Admin directly mark kar sakta hai
   - Present button (green)
   - Absent button (red)
   - Late button (yellow)

2. **Today's Summary** - Dashboard cards
   - Total Students
   - Present count
   - Absent count
   - Late count
   - Not Marked count

3. **Attendance Summary Table** - Historical data
   - Total days
   - Present/Absent/Late counts
   - Percentage calculation
   - Performance indicator

4. **Send Notifications** - Automatic emails
   - < 80% attendance → Warning email
   - ≥ 80% attendance → Congratulations email

---

## Attendance Manager Workflow

### Option A: Admin Marks Directly
1. Admin opens Attendance tab
2. Marks each student as Present/Absent/Late
3. Data automatically saved
4. Summary updates in real-time

### Option B: Manager Marks via Email Link
1. Admin sends reminder email via Broadcast
2. Manager opens dashboard link
3. Manager marks attendance
4. System sends confirmation

---

## Quick Email Template

**Subject:** Attendance Reminder - [Date]

**Message:**
```
Hi [Manager Name],

Please mark attendance for today's class.

📅 Date: [Date]
🏫 Class: [Class Name]
⏰ Time: [Time]

Steps:
1. Open: http://localhost:5173
2. Go to Attendance tab
3. Mark Present/Absent/Late for each student
4. Click Refresh to see updated summary

Students to mark:
- Sanjay Thakor
- Shyanjali Datta
- [Other students...]

Thank you!
```

---

## Automated Reminder (Future Feature)

Agar aap chahte ho ki daily automatic reminder jaye, toh:

1. **Cron Job** setup karo (Node-cron)
2. **Scheduled Email** har morning 9 AM
3. **Auto-reminder** agar attendance not marked by 10 AM

Yeh feature abhi implement nahi hai, lekin easily add kar sakte hain.

---

## Current Best Practice

**Use Broadcast Component:**
- Most flexible
- Can customize message
- Can select specific managers
- Works with Gmail
- All emails logged

**Steps:**
1. Broadcast tab → Compose email
2. Select attendance manager
3. Send reminder
4. Manager marks attendance
5. Admin checks summary

✅ Simple aur effective!
