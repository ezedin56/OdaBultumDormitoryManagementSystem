# Database Backup & Cache Testing Guide

## Quick Test Steps

### Prerequisites
1. Backend running on port 5000
2. Frontend running on port 5173
3. Logged in as admin user
4. MongoDB connected with some data

---

## Test 1: View System Information

**Steps:**
1. Login as admin
2. Navigate to **Settings → Database** tab
3. Look at the "System Information" card

**Expected Results:**
- ✅ Shows "Version: 1.0.0"
- ✅ Shows "Database: MongoDB Atlas"
- ✅ Shows "Total Students: [number]" (actual count from database)
- ✅ Shows "Total Rooms: [number]" (actual count from database)
- ✅ Shows "Last Backup: Never" (first time)
- ✅ Shows "Cache Status: Active" (green color)
- ✅ Shows "System Status: Active" (green color)

---

## Test 2: Create Database Backup

**Steps:**
1. In Settings → Database tab
2. Click "Download Backup" button
3. Wait for download to complete

**Expected Results:**
- ✅ Button shows "Creating Backup..." during process
- ✅ File downloads automatically
- ✅ Filename format: `database_backup_2026-02-03_[timestamp].json`
- ✅ Success message appears: "Database backup downloaded successfully! File: [filename]"
- ✅ "Last Backup" in System Information updates to current time
- ✅ File can be opened and contains valid JSON

**Verify Backup File Contents:**
Open the downloaded JSON file and verify:
- ✅ Has `metadata` section with backupDate, version, system
- ✅ Has `data` section with students, rooms, users, systemSettings
- ✅ Has `statistics` section with counts
- ✅ Student data includes all fields
- ✅ Room data includes occupants
- ✅ User data does NOT include passwords
- ✅ All data is properly formatted JSON

---

## Test 3: Clear Cache

**Steps:**
1. In Settings → Database tab
2. Click "Clear Cache" button
3. Read the confirmation dialog
4. Click "OK" to confirm

**Expected Results:**
- ✅ Confirmation dialog appears with warning message
- ✅ Dialog lists what will be cleared
- ✅ Button shows loading state during process
- ✅ Success message appears: "Cache cleared successfully! Browser and server cache have been reset."
- ✅ Second dialog asks: "Cache cleared! Would you like to refresh the page to see the changes?"
- ✅ Cache Status in System Information updates to show cleared time
- ✅ User remains logged in (authentication preserved)

**If you click "OK" to refresh:**
- ✅ Page refreshes
- ✅ User is still logged in
- ✅ Settings page loads correctly
- ✅ System Information shows updated cache status

---

## Test 4: Error Handling - Backup Without Auth

**Steps:**
1. Open browser DevTools → Application → Local Storage
2. Delete the `userInfo` key
3. Try to click "Download Backup"

**Expected Results:**
- ✅ Error message appears: "Authentication required. Please login again."
- ✅ No file downloads
- ✅ User is redirected to login (or shown error)

---

## Test 5: Error Handling - Cache Clear Without Auth

**Steps:**
1. Open browser DevTools → Application → Local Storage
2. Delete the `userInfo` key
3. Try to click "Clear Cache"

**Expected Results:**
- ✅ Error message appears: "Authentication required. Please login again."
- ✅ Cache is not cleared
- ✅ User is redirected to login (or shown error)

---

## Test 6: Multiple Backups

**Steps:**
1. Create first backup (Test 2)
2. Wait 5 seconds
3. Create second backup
4. Compare the two files

**Expected Results:**
- ✅ Both files download successfully
- ✅ Filenames have different timestamps
- ✅ Both files contain valid data
- ✅ "Last Backup" time updates after each backup
- ✅ Data in both files reflects current database state

---

## Test 7: Cache Clear Cancellation

**Steps:**
1. Click "Clear Cache" button
2. Read confirmation dialog
3. Click "Cancel"

**Expected Results:**
- ✅ Dialog closes
- ✅ Cache is NOT cleared
- ✅ No success message appears
- ✅ Cache Status remains unchanged
- ✅ System continues working normally

---

## Test 8: System Info Auto-Refresh

**Steps:**
1. Open Settings → Database tab
2. Note the student count
3. Open another tab/window
4. Add a new student in Students section
5. Return to Settings → Database tab
6. Switch to another tab (e.g., Profile)
7. Switch back to Database tab

**Expected Results:**
- ✅ Student count updates when switching back to Database tab
- ✅ System Information refreshes automatically
- ✅ All counts are accurate

---

## Test 9: Backup with Large Dataset

**Steps:**
1. Import 100+ students (use bulk import)
2. Create multiple rooms
3. Navigate to Settings → Database
4. Click "Download Backup"

**Expected Results:**
- ✅ Backup completes successfully (may take a few seconds)
- ✅ File size is larger (reflects more data)
- ✅ All 100+ students are in the backup file
- ✅ All rooms are in the backup file
- ✅ Statistics show correct counts
- ✅ No timeout errors

---

## Test 10: Backend API Direct Testing

**Using Postman or curl:**

### Test Backup Endpoint
```bash
curl -X GET http://localhost:5000/api/backup/database \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -o backup.json
```

**Expected:**
- ✅ Returns 200 status
- ✅ Downloads JSON file
- ✅ File contains all data

### Test Backup Stats Endpoint
```bash
curl -X GET http://localhost:5000/api/backup/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:**
- ✅ Returns 200 status
- ✅ JSON response with statistics

### Test Cache Clear Endpoint
```bash
curl -X POST http://localhost:5000/api/cache/clear \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:**
- ✅ Returns 200 status
- ✅ JSON response: `{"success": true, "message": "Cache cleared successfully", "clearedAt": "..."}`

### Test Cache Stats Endpoint
```bash
curl -X GET http://localhost:5000/api/cache/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:**
- ✅ Returns 200 status
- ✅ JSON response with cache statistics

---

## Test 11: Console Logging

**Steps:**
1. Open browser DevTools → Console
2. Perform backup operation
3. Perform cache clear operation

**Expected Console Logs:**

**For Backup:**
```
📦 Requesting database backup...
✅ Backup downloaded: database_backup_2026-02-03_1738612345678.json
```

**For Cache Clear:**
```
🧹 Clearing cache...
✅ Cache cleared successfully
```

---

## Test 12: Network Tab Verification

**Steps:**
1. Open browser DevTools → Network tab
2. Perform backup operation
3. Check network requests

**Expected:**
- ✅ Request to `/api/backup/database` with GET method
- ✅ Status: 200 OK
- ✅ Response type: application/json
- ✅ Response size matches data volume

**For Cache Clear:**
- ✅ Request to `/api/cache/clear` with POST method
- ✅ Status: 200 OK
- ✅ Response: `{"success": true, ...}`

---

## Common Issues & Solutions

### Issue: "Authentication required" error
**Solution:** 
- Ensure you're logged in as admin
- Check if token exists in localStorage
- Try logging out and logging back in

### Issue: Backup file is empty or corrupted
**Solution:**
- Check backend console for errors
- Verify MongoDB connection
- Ensure data exists in database
- Check CORS settings

### Issue: Cache clear doesn't work
**Solution:**
- Check backend is running
- Verify API endpoint is accessible
- Check browser console for errors
- Ensure admin permissions

### Issue: System Information shows 0 for all counts
**Solution:**
- Check if Database tab is active
- Verify backend API is responding
- Check network tab for failed requests
- Ensure data exists in database

---

## Success Criteria ✅

All tests pass if:
- [x] Database backup downloads successfully
- [x] Backup file contains valid JSON with all data
- [x] Passwords are excluded from backup
- [x] Cache clears on both server and browser
- [x] User authentication is preserved after cache clear
- [x] System Information displays accurate counts
- [x] Last backup time updates correctly
- [x] Cache status updates correctly
- [x] Error messages are clear and helpful
- [x] Loading states work properly
- [x] Confirmation dialogs appear as expected
- [x] All operations work with authentication

---

## Performance Benchmarks

### Backup Operation
- Small dataset (< 100 records): < 1 second
- Medium dataset (100-1000 records): 1-3 seconds
- Large dataset (> 1000 records): 3-10 seconds

### Cache Clear Operation
- Should complete in < 1 second
- Page refresh (if chosen): 1-2 seconds

### System Info Load
- Should load in < 500ms
- Updates should be instant

---

## Notes

- Always test with admin account
- Backup files can be large with lots of data
- Cache clear is safe - authentication is preserved
- System Information updates automatically when tab is opened
- All operations require active backend connection
- MongoDB must be connected and accessible
