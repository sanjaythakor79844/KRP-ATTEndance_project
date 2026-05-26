# 🧪 CSV/EXCEL IMPORT - TESTING GUIDE

## 📅 Date: February 24, 2026

---

## ✅ FEATURE STATUS

### Import Feature: ALREADY IMPLEMENTED ✅
Code already hai! Bas test karna hai.

---

## 🧪 HOW TO TEST

### Step 1: Create Test CSV File
```csv
name,email,assignmentLimit,status
Test Student 1,test1@example.com,3,active
Test Student 2,test2@example.com,5,active
Test Student 3,test3@example.com,3,active
```

Save as: `test_students.csv`

### Step 2: Test Import
```
1. Open: https://krp-att-endance-project.vercel.app
2. Login with: krp@2024
3. Go to Students tab
4. Click "Import CSV/Excel" button
5. Select your test_students.csv file
6. Wait for import to complete
7. Check if students appear in list
```

### Step 3: Verify Results
```
✅ Import results card should show:
   - Successfully added: 3
   - Failed: 0

✅ Students list should show:
   - Test Student 1
   - Test Student 2
   - Test Student 3
```

---

## 📊 SAMPLE TEST FILES

### Minimal CSV (test1.csv):
```csv
name,email
John Doe,john@example.com
Jane Smith,jane@example.com
```

### Full CSV (test2.csv):
```csv
name,email,assignmentLimit,status
Alice Johnson,alice@example.com,5,active
Bob Williams,bob@example.com,3,active
Charlie Brown,charlie@example.com,4,inactive
```

### With Errors (test3.csv):
```csv
name,email,assignmentLimit,status
Valid Student,valid@example.com,3,active
,missing-name@example.com,3,active
Invalid Email,not-an-email,3,active
```

Expected Result:
- ✅ 1 success (Valid Student)
- ❌ 2 failures (missing name, invalid email)

---

## 🔍 DEBUGGING

### If Import Button Not Working:
```
1. Check browser console (F12)
2. Look for errors
3. Verify file is selected
4. Try different browser
```

### If No Students Added:
```
1. Check import results card
2. Look at error messages
3. Verify CSV format
4. Check API connection
```

### If Page Crashes:
```
1. Check if xlsx library loaded
2. Verify papaparse library loaded
3. Check browser compatibility
4. Try smaller file
```

---

## 📦 DEPENDENCIES CHECK

### Required Libraries:
```json
{
  "papaparse": "^5.5.3",
  "xlsx": "^0.18.5"
}
```

### Verify Installation:
```bash
npm list papaparse
npm list xlsx
```

---

## 🎯 EXPECTED BEHAVIOR

### When File Selected:
```
1. File input triggers handleFileImport
2. File type validated (.csv, .xlsx, .xls)
3. File parsed (CSV or Excel)
4. Data validated row by row
5. API calls made for each student
6. Results displayed in card
7. Student list refreshed
```

### Success Flow:
```
User clicks Import
→ Selects file
→ File parsed
→ Data validated
→ Students added to MongoDB
→ Success message shown
→ List refreshed
→ Students visible
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Import button visible
- [ ] File input accepts .csv, .xlsx, .xls
- [ ] CSV files parse correctly
- [ ] Excel files parse correctly
- [ ] Email validation works
- [ ] Duplicate detection works
- [ ] Error messages show
- [ ] Success count correct
- [ ] Students appear in list
- [ ] MongoDB data persists

---

## 🚀 DEPLOYMENT CHECK

### Vercel Build:
```
✅ Check if xlsx is in dependencies
✅ Check if build succeeds
✅ Check if no import errors
✅ Check if bundle size OK
```

### Runtime Check:
```
✅ Open browser console
✅ Check for library load errors
✅ Test import functionality
✅ Verify API calls work
```

---

## 💡 TROUBLESHOOTING

### Error: "xlsx is not defined"
```
Solution:
1. Verify xlsx in package.json
2. Run npm install
3. Rebuild and redeploy
4. Clear browser cache
```

### Error: "Papa is not defined"
```
Solution:
1. Verify papaparse in package.json
2. Check import statement
3. Rebuild and redeploy
```

### Error: "Failed to fetch"
```
Solution:
1. Check API_BASE_URL in config.ts
2. Verify backend is running
3. Check CORS settings
4. Test API endpoint directly
```

---

## 🎓 QUICK TEST SCRIPT

### Create test.csv:
```csv
name,email
Quick Test,quicktest@example.com
```

### Test Steps:
```
1. Save above as test.csv
2. Go to Students tab
3. Click Import CSV/Excel
4. Select test.csv
5. Should see: "Successfully added: 1"
6. Should see "Quick Test" in list
```

---

**Status:** ✅ Code implemented, ready to test
**Action:** Test import feature on live site

