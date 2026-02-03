# Excel/CSV Import Headers Guide

## Overview
The system accepts Excel (.xlsx) or CSV (.csv) files to import student data and automatically assign them to dormitories.

## Required Headers (Columns)

The system is flexible with column names and accepts multiple variations. Here are the accepted headers:

### 1. **Student ID** (REQUIRED)
Accepted column names (case-insensitive):
- `ID`
- `studentId`
- `StudentID`
- `Student ID`
- `student_id`
- `id`
- `Student Id`
- `STUDENT ID`

**Example values**: `UGPR1209/16`, `STU001`, `2024/001`

---

### 2. **Full Name** (REQUIRED)

**Option A: Single Column for Full Name**

Accepted column names (case-insensitive):
- `English Name`
- `English name`
- `english name`
- `ENGLISH NAME`
- `fullName`
- `FullName`
- `Full Name`
- `full_name`
- `Name`
- `name`
- `FULL NAME`
- `Student Name`
- `StudentName`
- `student_name`
- `STUDENT NAME`

**Example values**: `John Doe Smith`, `Abebe Kebede Tesfaye`, `Sara Ahmed Hassan`

**Option B: Separate Columns for Name Parts**

If full name is not provided, the system will automatically combine separate name columns:

**First Name** (accepts):
- `First Name`
- `FirstName`
- `first_name`
- `firstname`
- `FIRST NAME`
- `First name`
- `first name`
- `Given Name`
- `given_name`
- `GIVEN NAME`

**Middle Name** (accepts):
- `Middle Name`
- `MiddleName`
- `middle_name`
- `middlename`
- `MIDDLE NAME`
- `Middle name`
- `middle name`
- `Father Name`
- `father_name`
- `FATHER NAME`
- `Fathers Name`
- `fathers_name`

**Last Name** (accepts):
- `Last Name`
- `LastName`
- `last_name`
- `lastname`
- `LAST NAME`
- `Last name`
- `last name`
- `Surname`
- `surname`
- `SURNAME`
- `Family Name`
- `family_name`
- `FAMILY NAME`
- `Grand Father Name`
- `grandfather_name`
- `GRAND FATHER NAME`

**Example**: 
- First Name: `John`, Middle Name: `Doe`, Last Name: `Smith` → Full Name: `John Doe Smith`
- First Name: `Abebe`, Father Name: `Kebede`, Grand Father Name: `Tesfaye` → Full Name: `Abebe Kebede Tesfaye`

**Note**: You can use EITHER Option A (single full name column) OR Option B (separate name columns). The system will automatically detect and use whichever format you provide.

---

### 3. **Gender** (REQUIRED)
Accepted column names (case-insensitive):
- `S`
- `s`
- `gender`
- `Gender`
- `Sex`
- `sex`
- `GENDER`
- `SEX`

**Accepted values**:
- `M` or `Male` (for male students)
- `F` or `Female` (for female students)

---

### 4. **Department** (REQUIRED)
Accepted column names (case-insensitive):
- `Dept`
- `dept`
- `DEPT`
- `department`
- `Department`
- `DEPARTMENT`

**Example values**: `Computer Science`, `Engineering`, `Medicine`, `Business`

---

### 5. **Year/Level** (REQUIRED)
Accepted column names (case-insensitive):
- `Year`
- `year`
- `YEAR`
- `Level`
- `level`
- `LEVEL`
- `Year Level`
- `year_level`

**Accepted values**:
- Numbers: `1`, `2`, `3`, `4`, `5`, `6`, `7`
- Text: `1st`, `2nd`, `3rd`, `4th`, `5th`, `6th`, `7th`
- Words: `first`, `second`, `third`, `fourth`, `fifth`, `sixth`, `seventh`

---

### 6. **Phone Number** (OPTIONAL)
Accepted column names (case-insensitive):
- `phone`
- `Phone`
- `PhoneNumber`
- `Phone Number`
- `phone_number`
- `Contact`
- `contact`
- `PHONE`
- `CONTACT`
- `Mobile`
- `mobile`
- `Tel`
- `tel`

**Example values**: `+251912345678`, `0912345678`, `251912345678`

---

### 7. **List Number / Order** (OPTIONAL)
Accepted column names (case-insensitive):
- `No`
- `no`
- `NO`
- `Number`
- `number`
- `NUMBER`
- `List Number`
- `list_number`
- `ListNumber`
- `LIST NUMBER`
- `List No`
- `list_no`
- `LIST NO`
- `#`
- `S/N`
- `s/n`
- `SN`
- `sn`
- `Serial`
- `serial`
- `SERIAL`
- `Order`
- `order`
- `ORDER`

**Example values**: `1`, `2`, `3`, `4`, `5`, etc.

**Purpose**: Used to maintain the original order/sequence of students from the source list. Useful for:
- Preserving registration order
- Maintaining alphabetical sorting
- Tracking student list positions
- Report generation in specific order

**Note**: Must be a positive integer. Invalid values will be ignored (student will still be imported without list number).

---

## Sample Excel/CSV Format

### Option 1: Simple Format (Full Name in One Column)
```
No,ID,English Name,S,Dept,Year,Phone
1,UGPR1209/16,John Doe Smith,M,Computer Science,1,0912345678
2,UGPR1210/16,Jane Mary Smith,F,Engineering,2,0923456789
3,UGPR1211/16,Ahmed Ali Hassan,M,Medicine,3,0934567890
```

### Option 2: Separate Name Columns (First, Middle, Last)
```
#,ID,First Name,Middle Name,Last Name,S,Dept,Year,Phone
1,UGPR1209/16,John,Doe,Smith,M,Computer Science,1,0912345678
2,UGPR1210/16,Jane,Mary,Smith,F,Engineering,2,0923456789
3,UGPR1211/16,Ahmed,Ali,Hassan,M,Medicine,3,0934567890
```

### Option 3: Ethiopian Format (First, Father, Grandfather)
```
S/N,ID,First Name,Father Name,Grand Father Name,Gender,Department,Year,Contact
1,STU001,Abebe,Kebede,Tesfaye,Male,Computer Science,1st,+251912345678
2,STU002,Sara,Ahmed,Hassan,Female,Engineering,2nd,+251923456789
3,STU003,Dawit,Tesfaye,Bekele,Male,Business,3rd,+251934567890
```

### Option 4: Detailed Format (Full Name)
```
List No,Student ID,Full Name,Gender,Department,Year Level,Phone Number
1,STU001,Abebe Kebede Tesfaye,Male,Computer Science,1st,+251912345678
2,STU002,Sara Ahmed Hassan,Female,Engineering,2nd,+251923456789
3,STU003,Dawit Tesfaye Bekele,Male,Business,3rd,+251934567890
```

### Option 5: Without List Numbers (Still Valid)
```
id,name,sex,dept,year,contact
001,Student One Name,M,CS,1,0911111111
002,Student Two Name,F,ENG,2,0922222222
003,Student Three Name,M,MED,3,0933333333
```

---

## Import Process

1. **File Upload**: Admin uploads Excel or CSV file
2. **Parsing**: System reads and parses the file
3. **Validation**: Each row is validated for required fields
4. **Auto-Assignment**: Students are automatically assigned to available dorms based on:
   - Gender (male/female blocks)
   - Available room capacity
   - Room availability status
5. **Results**: System shows:
   - Number of students imported successfully
   - Number of students assigned to rooms
   - Any errors encountered

---

## Important Notes

### ✅ Flexible Column Names
- The system is **case-insensitive**
- Spaces and underscores are treated the same
- Multiple variations are accepted for each field

### ✅ Gender-Based Assignment
- Male students (`M`) are assigned to male blocks
- Female students (`F`) are assigned to female blocks
- System respects gender-specific dormitory blocks

### ✅ Automatic Room Assignment
- Students are automatically assigned to available rooms
- System checks room capacity before assignment
- Rooms marked as "Under Maintenance" are skipped

### ⚠️ Error Handling
- Rows with missing required fields are skipped
- Invalid data (e.g., invalid year) is reported
- Duplicate student IDs are handled appropriately
- All errors are logged and reported to admin

### 📊 Supported File Types
- **Excel**: `.xlsx`, `.xls`
- **CSV**: `.csv`

---

## Example Files

### Minimal Required Columns - Option A (Full Name)
```csv
ID,English Name,S,Dept,Year
UGPR1209/16,John Doe Smith,M,Computer Science,1
UGPR1210/16,Jane Mary Smith,F,Engineering,2
```

### Minimal Required Columns - Option B (Separate Names)
```csv
ID,First Name,Middle Name,Last Name,Gender,Department,Year
UGPR1209/16,John,Doe,Smith,M,Computer Science,1
UGPR1210/16,Jane,Mary,Smith,F,Engineering,2
```

### Complete Format with Full Name (CSV)
```csv
Student ID,Full Name,Gender,Department,Year Level,Phone Number
UGPR1209/16,John Doe Smith,Male,Computer Science,1st,+251912345678
UGPR1210/16,Jane Mary Smith,Female,Engineering,2nd,+251923456789
UGPR1211/16,Ahmed Ali Hassan,Male,Medicine,3rd,+251934567890
UGPR1212/16,Sara Ahmed Hassan,Female,Business,1st,+251945678901
```

### Complete Format with Separate Names (CSV)
```csv
Student ID,First Name,Father Name,Grand Father Name,Gender,Department,Year Level,Phone Number
UGPR1209/16,Abebe,Kebede,Tesfaye,Male,Computer Science,1st,+251912345678
UGPR1210/16,Sara,Ahmed,Hassan,Female,Engineering,2nd,+251923456789
UGPR1211/16,Dawit,Tesfaye,Bekele,Male,Medicine,3rd,+251934567890
UGPR1212/16,Hanna,Girma,Alemu,Female,Business,1st,+251945678901
```

---

## Name Format Options

The system supports **TWO different formats** for student names:

### Format 1: Full Name in Single Column ✅
Use one column with the complete name:
- Column: `Full Name` or `English Name` or `Name`
- Example: `Abebe Kebede Tesfaye`

**Best for**: 
- Simple imports
- When names are already combined
- International naming conventions

### Format 2: Separate Name Columns ✅
Use multiple columns for name parts:
- Columns: `First Name`, `Middle Name`, `Last Name`
- OR: `First Name`, `Father Name`, `Grand Father Name`
- Example: First=`Abebe`, Father=`Kebede`, Grandfather=`Tesfaye`

**Best for**:
- Ethiopian naming conventions
- When source data has separated names
- More structured data

### How It Works:
1. System first looks for a full name column
2. If not found, it looks for separate name columns
3. Automatically combines: `First + Middle + Last` → `Full Name`
4. All name parts are trimmed and joined with spaces
5. Empty name parts are automatically skipped

### Examples:

**Example 1: Full Name**
```csv
ID,Full Name,Gender,Dept,Year
001,Abebe Kebede Tesfaye,M,CS,1
```

**Example 2: Separate Names (Western)**
```csv
ID,First Name,Middle Name,Last Name,Gender,Dept,Year
001,John,Michael,Smith,M,CS,1
```

**Example 3: Separate Names (Ethiopian)**
```csv
ID,First Name,Father Name,Grand Father Name,Gender,Dept,Year
001,Abebe,Kebede,Tesfaye,M,CS,1
```

**Example 4: Only First and Last**
```csv
ID,First Name,Last Name,Gender,Dept,Year
001,John,Smith,M,CS,1
```
Result: `John Smith` (middle name skipped automatically)

---

## Validation Rules

1. **Student ID**: Must be unique, cannot be empty
2. **Full Name**: Cannot be empty (or must have at least first name if using separate columns)
3. **Gender**: Must be M/F or Male/Female
4. **Department**: Cannot be empty
5. **Year**: Must be between 1-7
6. **Phone**: Optional, can be empty
7. **List Number**: Optional, must be a positive integer if provided

---

## Tips for Best Results

1. ✅ Use the first row for column headers
2. ✅ Ensure no empty rows in the middle of data
3. ✅ Use consistent gender values (all M/F or all Male/Female)
4. ✅ Remove any formatting (colors, borders) from Excel
5. ✅ Save Excel as `.xlsx` format (not `.xls`)
6. ✅ For CSV, use UTF-8 encoding
7. ✅ Test with a small file first (5-10 students)
8. ✅ **Name Format**: Use EITHER full name in one column OR separate first/middle/last name columns (not both)
9. ✅ **Ethiopian Names**: You can use "Father Name" and "Grand Father Name" columns for traditional naming
10. ✅ **Flexible**: Mix and match column name variations - the system will find them

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Missing required fields" | Check that all 5 required columns are present |
| "Invalid year value" | Use numbers 1-7 or text like "1st", "2nd" |
| "Invalid gender" | Use only M/F or Male/Female |
| "File is empty" | Ensure file has data rows (not just headers) |
| "Failed to parse file" | Check file format, try saving as new file |

---

## Where to Import

1. Login as Admin
2. Navigate to **Students** page
3. Click **Import Students** button
4. Select your Excel/CSV file
5. Click **Upload & Import**
6. Review import results

---

## After Import

- Students are automatically assigned to available rooms
- View assignments in the Students page
- Generate reports to see all assignments
- Students can check their room using the Student Portal
