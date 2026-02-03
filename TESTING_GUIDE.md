# Testing Guide - Auto-Allocation & Max Students Per Room

## Quick Test Steps

### Test 1: Verify System Settings Display
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Login as admin
4. Navigate to **Settings → System** tab
5. **Expected Results:**
   - ✅ See "Auto-Allocate Students" toggle
   - ✅ See status indicator (green if enabled, yellow if disabled)
   - ✅ See "Maximum Students Per Room" slider (1-8)
   - ✅ See info box explaining impact of max students setting

### Test 2: Change Max Students Per Room
1. In Settings → System tab
2. Adjust "Maximum Students Per Room" slider to **6**
3. Click "Save System Settings"
4. Navigate to **Dormitories** section
5. Click "Add Room" button
6. **Expected Results:**
   - ✅ Capacity field shows **6** as default value
   - ✅ Helper text shows "System default: 6 students"

### Test 3: Auto-Allocation Enabled
1. In Settings → System tab
2. Enable "Auto-Allocate Students" toggle
3. **Expected Results:**
   - ✅ Status indicator turns green
   - ✅ Shows "Auto-Allocation Active"
   - ✅ Description: "Students will be automatically assigned to rooms during import"
4. Click "Save System Settings"
5. Navigate to **Students** section
6. Import a CSV file with students
7. **Expected Results:**
   - ✅ Alert shows: "✅ Success! Imported X students"
   - ✅ Alert shows: "🏠 Auto-Allocation: ✅ Y students allocated to rooms"
   - ✅ If some students couldn't be allocated: "⏳ Z students waiting for rooms"

### Test 4: Auto-Allocation Disabled
1. In Settings → System tab
2. Disable "Auto-Allocate Students" toggle
3. **Expected Results:**
   - ✅ Status indicator turns yellow
   - ✅ Shows "Auto-Allocation Disabled"
   - ✅ Description: "Students must be manually allocated to rooms after import"
4. Click "Save System Settings"
5. Navigate to **Students** section
6. Import a CSV file with students
7. **Expected Results:**
   - ✅ Alert shows: "✅ Success! Imported X students"
   - ✅ Alert shows: "ℹ️ Auto-allocation is disabled in system settings"
   - ✅ No automatic allocation happens

### Test 5: Manual Allocation Still Works
1. With auto-allocation disabled
2. Navigate to **Students** section
3. Scroll to "Auto-Allocate Dorms" section
4. Click "Run Allocation" button
5. **Expected Results:**
   - ✅ Students are manually allocated
   - ✅ Alert shows allocation results
   - ✅ Success message with male/female breakdown

### Test 6: Room Creation Uses Default Capacity
1. Set max students per room to **5** in Settings
2. Save settings
3. Navigate to **Dormitories**
4. Click "Add Block" (if needed)
5. Click "Add Room"
6. **Expected Results:**
   - ✅ Capacity field pre-filled with **5**
   - ✅ Helper text: "System default: 5 students"
7. Change capacity to **8** manually
8. Save room
9. **Expected Results:**
   - ✅ Room created with capacity **8** (manual override works)

### Test 7: Validation
1. In Settings → System tab
2. Try to set max students per room to **0**
3. **Expected Results:**
   - ✅ Error message: "Value must be between 1 and 8"
   - ✅ Save button disabled
4. Try to set max students per room to **10**
5. **Expected Results:**
   - ✅ Error message: "Value must be between 1 and 8"
   - ✅ Save button disabled

---

## Sample Test Data

### CSV File for Import Testing
Create a file named `test_students.csv`:

```csv
ID,English Name,S,Dept,Year
OBU/001/2024,John Doe,M,Computer Science,1
OBU/002/2024,Jane Smith,F,Engineering,2
OBU/003/2024,Bob Johnson,M,Business,1
OBU/004/2024,Alice Williams,F,Computer Science,3
OBU/005/2024,Charlie Brown,M,Engineering,1
```

---

## Expected Behavior Summary

| Setting | Import Behavior | Room Creation |
|---------|----------------|---------------|
| Auto-Allocation ON | Students automatically assigned to rooms | Uses system default capacity |
| Auto-Allocation OFF | Students imported but not assigned | Uses system default capacity |
| Max Students = 4 | N/A | New rooms default to 4 capacity |
| Max Students = 8 | N/A | New rooms default to 8 capacity |

---

## Troubleshooting

### Issue: Auto-allocation not working
- Check if auto-allocation is enabled in Settings
- Verify there are available rooms with matching gender
- Check room capacity (rooms must have space)

### Issue: Default capacity not showing
- Refresh the page after changing settings
- Check browser console for errors
- Verify backend is running and settings API is accessible

### Issue: Status indicator not updating
- Click "Save System Settings" after making changes
- Refresh the page to see updated status

---

## Success Criteria ✅

All tests pass if:
- [x] Settings page shows auto-allocation status indicator
- [x] Settings page shows max students per room with impact explanation
- [x] Room creation uses system default capacity
- [x] Auto-allocation works during import when enabled
- [x] Import feedback shows allocation results
- [x] Manual allocation still works when auto-allocation is disabled
- [x] Validation prevents invalid values (< 1 or > 8)
- [x] All changes persist after page refresh

---

## Notes

- Backend must be running on port 5000
- Frontend must be running on port 5173
- Admin credentials required for testing
- MongoDB must be connected
- At least one block and room should exist for allocation testing
