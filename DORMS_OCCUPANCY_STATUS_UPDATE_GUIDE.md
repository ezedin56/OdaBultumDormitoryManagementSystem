# Dormitories Section - Occupancy & Status Update Guide

## How It Works

When students are assigned to rooms from the **Students section**, the **Dormitories section** automatically updates to reflect:
1. **Occupancy Count**: Shows exact number of students in each room
2. **Status**: Changes from "Available" to "Full" when capacity is reached
3. **Visual Metrics**: Progress bars and color-coded indicators

## Example Scenario

### Before Assignment:
**Wing-A, Room 101**
- Capacity: 6 students
- Occupancy: 0/6 (0%)
- Status: Available
- Progress Bar: Empty (Green)

### After Assigning 6 Students:
**Wing-A, Room 101**
- Capacity: 6 students
- Occupancy: 6/6 (100%)
- Status: Full
- Progress Bar: Completely filled (Red)

### After Assigning 4 Students (Partial):
**Wing-A, Room 101**
- Capacity: 6 students
- Occupancy: 4/6 (67%)
- Status: Available
- Progress Bar: 67% filled (Orange)

## Backend Logic

### When Students Are Assigned (`autoAllocate` function):

```javascript
// For each room being assigned:
1. Add students to room.occupants array
2. Update student.room reference
3. Check occupancy vs capacity:
   - If occupants.length >= capacity → status = 'Full'
   - If occupants.length > 0 but < capacity → status = 'Available'
4. Save room with updated status
```

### Room Query Fix:
- **OLD**: `{ status: { $ne: 'Under Maintenance' }, status: { $ne: 'Full' } }` ❌ (Duplicate key)
- **NEW**: `{ status: { $ne: 'Under Maintenance' } }` ✅ (Allows filling rooms)

## Frontend Auto-Refresh

The Dormitories section automatically refreshes every 5 seconds to show latest data:

```javascript
useEffect(() => {
    fetchRooms();
    
    // Auto-refresh every 5 seconds
    const refreshInterval = setInterval(() => {
        fetchRooms(true);
    }, 5000);
    
    return () => clearInterval(refreshInterval);
}, []);
```

### Visual Indicators:
- **Green Badge**: "Auto-updating..." appears during refresh
- **Pulsing Dot**: Animated indicator shows active refresh
- **Subtitle**: "Auto-refreshes every 5 seconds" informs users

## Status Color Coding

### Room Status Badge:
- **Available** (Green): `#dcfce7` background, `#166534` text
- **Full** (Red): `#fee2e2` background, `#991b1b` text
- **Under Maintenance** (Gray): Preserved, not affected by assignments

### Occupancy Progress Bar:
- **< 75%** (Green): `#10b981` - Room has plenty of space
- **75-99%** (Orange): `#f59e0b` - Room is filling up
- **100%** (Red): `#dc2626` - Room is completely full

## Testing Workflow

### Step 1: Check Initial State
1. Go to **Dormitories** section
2. Find a room (e.g., Wing-A, Room 101)
3. Note current occupancy (e.g., 0/6)
4. Note current status (e.g., Available)

### Step 2: Assign Students
1. Go to **Students** section
2. Click "Auto-Allocate Dorms"
3. Optional: Use filters to target specific building/block
4. Click "Run Allocation"
5. Wait for success message

### Step 3: Verify Updates
1. Return to **Dormitories** section (or keep it open in another tab)
2. Within 5 seconds, observe:
   - ✅ Occupancy count increases (e.g., 0/6 → 6/6)
   - ✅ Progress bar fills up
   - ✅ Status changes to "Full" if capacity reached
   - ✅ Color changes based on occupancy percentage
   - ✅ "Auto-updating..." badge appears briefly

### Step 4: Verify Specific Rooms
1. Check the exact rooms mentioned in allocation results
2. Verify occupancy matches number of students assigned
3. Verify status is correct:
   - "Full" if occupants = capacity
   - "Available" if occupants < capacity

## Block-Level Statistics

The block info card also updates automatically:

```
Wing-A Block Card:
- Total Rooms: 10
- Total Capacity: 60
- Occupied: 45 (updates in real-time)
- Occupancy Rate: 75% (calculated automatically)
```

## Troubleshooting

### Issue: Occupancy not updating
**Solution**: 
- Wait 5 seconds for auto-refresh
- Manually refresh page (F5)
- Check browser console for errors

### Issue: Status stuck on "Available" when full
**Solution**:
- Backend automatically updates status
- Frontend auto-refresh will show correct status within 5 seconds
- Verify backend is running on port 5000

### Issue: Wrong occupancy count
**Solution**:
- Check if students were actually assigned (check Students section)
- Verify room._id matches student.room reference
- Check backend logs for allocation errors

## API Endpoints Used

1. **GET /api/dorms** - Fetches all rooms with populated occupants
2. **POST /api/dorms/allocate** - Assigns students to rooms
3. **PUT /api/dorms/:id** - Updates individual room (manual edits)

## Database Updates

When students are assigned, the following database changes occur:

### Room Document:
```javascript
{
  _id: "room123",
  building: "Wing-A",
  roomNumber: "101",
  capacity: 6,
  occupants: ["student1", "student2", "student3", "student4", "student5", "student6"],
  status: "Full" // Auto-updated
}
```

### Student Document:
```javascript
{
  _id: "student1",
  studentId: "OBU/2024/001",
  fullName: "John Doe",
  room: "room123" // Reference to room
}
```

## Summary

✅ **Occupancy updates automatically** when students are assigned
✅ **Status changes automatically** based on occupancy vs capacity
✅ **Visual metrics update** with color-coded progress bars
✅ **Auto-refresh every 5 seconds** ensures data is always current
✅ **Block statistics update** to reflect total occupancy
✅ **Works across tabs** - changes in Students section reflect in Dormitories section

---

**Status**: ✅ Fully Implemented and Tested
**Last Updated**: 2026-02-04
