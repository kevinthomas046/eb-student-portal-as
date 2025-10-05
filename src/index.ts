/**
 * Copyright 2025 Elevation Beats Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  FamilyRecord,
  RecentAttendance,
  StudentRecord,
  AttendanceRecord,
  AdditionalFeesRecord,
  PaymentRecord,
  Sheet,
  FamilyEntry,
  StudentEntry,
  AttendanceEntry,
  ClassEntry,
  ClassGroupEntry,
  PaymentEntry,
  AdditionalFeesEntry,
} from './types/types';

const SPREADSHEET_ID: string =
  PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '';

/**
 * Special function that handles HTTP GET requests to the published web app.
 * @return {GoogleAppsScript.HTML.HtmlOutput} The HTML page to be served.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
function doGet() {
  Logger.log('Loading page');
  return HtmlService.createTemplateFromFile('page')
    .evaluate()
    .setTitle('Student Portal | Elevation Beats Inc');
}

/**
 * Includes template based on filename that has a nested include
 * @param filename file name to be included
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
function includeTemplate(filename: string) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Includes template based on filename
 * @param filename file name to be included
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function include(filename: string) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Retrieves a reference to a Google sheet by name.
 * @param {string} sheetName Name of the sheet to retrieve
 */
function getSheetByName<SheetEntryType>(
  sheetName: Sheet
): Array<SheetEntryType> {
  const cache = CacheService.getDocumentCache();
  const cachedSheetData = cache?.get(sheetName) ?? '';

  if (cachedSheetData !== '') {
    try {
      console.log(`Getting data from cache ${sheetName}`);
      const sheetData = JSON.parse(cachedSheetData);
      return sheetData;
    } catch (e) {
      return [];
    }
  }

  console.log(`Getting data from sheet ${sheetName}`);
  const sheet =
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet with name ${sheetName} not found.`);
  }

  const sheetData = sheet.getDataRange().getValues();
  cache?.put(sheetName, JSON.stringify(sheetData), 60);

  return sheetData as Array<SheetEntryType>;
}

/**
 * Cache filling function to get all sheets prematurely and populate in cache
 */
function getAllSheets() {
  getSheetByName('Families');
  getSheetByName('Classes');
  getSheetByName('ClassGroups');
  getSheetByName('Payments');
  getSheetByName('Students');
  getSheetByName('AdditionalFees');
  getSheetByName('Attendance');
}

/**
 * Retrieves a list of all families with their IDs and names from the Families google sheet.
 * @returns {Array<FamilyRow>} Array of objects containing family IDs and names.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
function getFamilies(): Array<FamilyRecord> {
  const familiesData = getSheetByName<FamilyEntry>('Families');
  const studentsData = getSheetByName<StudentEntry>('Students');

  const activeFamilies = Array.from(
    new Set(
      studentsData
        .slice(1)
        .filter(row => row[4] === true)
        .map(row => row[2])
    )
  );

  return familiesData
    .slice(1)
    .filter(row => row[0] && row[1] && activeFamilies.includes(row[0]))
    .map(row => ({ FamilyId: row[0], FamilyName: row[1] }) as FamilyRecord)
    .sort((familyA, familyB) => {
      const familyNameA = familyA.FamilyName.toUpperCase();
      const familyNameB = familyB.FamilyName.toUpperCase();

      if (familyNameA < familyNameB) {
        return -1;
      }

      if (familyNameA > familyNameB) {
        return 1;
      }

      return 0;
    });
}

/**
 * Retrieves a list of recent student attendence for a given familiy
 * @param {number} familyId ID of the family to retrieve recent attendance for
 * @returns {Array<RecentAttendance>} Array of objects containing family IDs and names.
 */
function getRecentAttendanceByFamily(
  familyId: number
): Array<RecentAttendance> {
  // get all students that belong to a particular family using familyId
  const studentsData = getSheetByName<StudentEntry>('Students');

  console.log('Getting attendance for family', familyId);

  const studentsInFamily: StudentRecord[] = studentsData
    .slice(1)
    .filter(row => row[2] === familyId)
    .map(row => ({ StudentId: row[0], StudentName: row[1] }));

  console.log('Students in family', familyId, 'are', studentsInFamily);

  // get attendance for each student in the family
  const attendanceData = getSheetByName<AttendanceEntry>('Attendance');

  const attendanceInFamily: AttendanceRecord[] = attendanceData
    .slice(1)
    .filter(row =>
      studentsInFamily.some(student => student.StudentId === row[1])
    )
    .map(row => ({
      AttendanceId: row[0],
      ClassId: row[2],
      StudentName: studentsInFamily.find(
        student => student.StudentId === row[1]
      )?.StudentName,
      Price: row[4].toString(),
    }));

  console.log('Attendance In Family', attendanceInFamily);

  // get class details for each attendance
  const classData = getSheetByName<ClassEntry>('Classes');
  const classGroupData = getSheetByName<ClassGroupEntry>('ClassGroups');

  const recentAttendance = attendanceInFamily
    .map(attendance => {
      const classDetails = classData.find(row => row[0] === attendance.ClassId);
      if (!classDetails)
        throw new Error(
          `Class details not found for ClassId: ${attendance.ClassId}`
        );
      const classGroupDetails = classGroupData.find(
        row => row[0] === classDetails[1]
      );
      if (!classGroupDetails)
        throw new Error(
          `Class group details not found for ClassGroupId: ${classDetails[1]}`
        );

      // Determine the correct price in the following order: Attendance -> Class -> Class Group
      const price =
        attendance.Price !== ''
          ? attendance.Price // Price from attendance record
          : classDetails[3] || // Price from class record
            classGroupDetails[2]; // Price from class group record

      console.log(
        `Price for ${attendance.AttendanceId} is in this priority: ${attendance.Price}, ${classDetails[3]}, ${classGroupDetails[2]}`
      );

      return {
        AttendanceId: attendance.AttendanceId,
        ClassDate: new Date(classDetails[2]).toLocaleDateString(),
        StudentName: attendance.StudentName || '',
        ClassGroupName: classGroupDetails[1],
        Price: price,
      } as RecentAttendance;
    })
    .sort(({ ClassDate: classDateA }, { ClassDate: classDateB }) => {
      return Date.parse(classDateB) - Date.parse(classDateA);
    });

  console.log(
    'Recent attendance of family ',
    familyId,
    ' is ',
    recentAttendance
  );

  return recentAttendance;
}

/*
"Create function to get a list of recent payments based on family ID selection.
Input: familyID
Output: [{ paymentID, paymentDate, paymentAmount }]"
*/
function getRecentPaymentsByFamily(familyId: number): PaymentRecord[] {
  const paymentsData = getSheetByName<PaymentEntry>('Payments');
  return paymentsData
    .slice(1)
    .filter(row => row[1] === familyId)
    .map(row => ({
      PaymentId: row[0],
      PaymentDate: new Date(row[2]).toLocaleDateString(),
      AmountPaid: row[3],
    }))
    .sort(({ PaymentDate: classDateA }, { PaymentDate: classDateB }) => {
      return Date.parse(classDateB) - Date.parse(classDateA);
    });
}

/**
 * A function to get a list of upcoming classes based on family ID selection.
Input: familyID
Output: [{ classID, classDate, classGroupName, amount }]"
 */
function getUpcomingClassesByFamily(familyId: number) {
  // Get a list of students where familyID = input.familyID AND active = true
  const studentsData = getSheetByName<StudentEntry>('Students');
  const uniqueClassGroupIds: number[] = Array.from(
    new Set(
      studentsData
        .slice(1)
        .filter(row => row[2] === familyId && row[4] === true)
        .map(row => row[3])
    )
  );

  console.log('Class groups for family ', familyId, 'are', uniqueClassGroupIds);

  // Get a list of classes from Class where classGroupID in array of classGroupIDs from uniqueClassGroupIds
  const classesData = getSheetByName<ClassEntry>('Classes');
  const classGroupsData = getSheetByName<ClassGroupEntry>('ClassGroups').filter(
    row => row[0] && row[1]
  );
  const today = Date.parse(new Date().toLocaleDateString());
  const isUpcomingClass = (row: ClassEntry): boolean => {
    const classDate = Date.parse(new Date(row[2]).toLocaleDateString());
    return uniqueClassGroupIds.includes(row[1]) && classDate >= today;
  };
  const upcomingClasses = classesData.slice(1).filter(isUpcomingClass);

  console.log('Upcoming classes for', familyId, upcomingClasses);
  return upcomingClasses.map(row => {
    // Find the class group data where ClassGroupId matches row[1]
    const classGroup = classGroupsData.find(group => group[0] === row[1]);

    return {
      ClassId: row[0],
      ClassDate: new Date(row[2]).toLocaleDateString(),
      ClassGroupName: classGroup ? classGroup[1] : null, // Get the ClassGroupName
      Price: row[3] ? row[3] : classGroup ? classGroup[2] : null, // Get PricePerClass if row[3] is empty
    };
  });
}

function getFeesMapByMonth(familyId: number) {
  // Get a list of students where familyID = input.familyID AND active = true
  const studentsData = getSheetByName<StudentEntry>('Students');
  const uniqueClassGroupIds: number[] = Array.from(
    new Set(
      studentsData
        .slice(1)
        .filter(row => row[2] === familyId && row[4] === true)
        .map(row => row[3])
    )
  );

  console.log('Class groups for family ', familyId, 'are', uniqueClassGroupIds);

  const classesData = getSheetByName<ClassEntry>('Classes');
  const classGroupsData = getSheetByName<ClassGroupEntry>('ClassGroups')
    .filter(row => row[0] && row[1])
    .reduce(
      (acc, [groupId, groupName, classPrice]) => {
        acc[groupId] = classPrice;
        return acc;
      },
      {} as Record<number, number>
    );

  const feesByMonthMap = classesData.slice(1).reduce(
    (acc, [classId, classGroupId, classDate, classPrice]) => {
      if (classId) {
        const classDateObj = new Date(classDate);
        const classMonth = classDateObj.getMonth();
        const classMonthLong = new Intl.DateTimeFormat('en-US', {
          month: 'long',
        }).format(classDateObj);
        const price = classPrice || classGroupsData[classGroupId];

        if (uniqueClassGroupIds.includes(classGroupId)) {
          if (acc[classMonth]) {
            acc[classMonth].price += price;
          } else {
            acc[classMonth] = {
              month: classMonthLong,
              price,
            };
          }
        }
      }
      return acc;
    },
    {} as Record<number, { price: number; month: string }>
  );

  return feesByMonthMap;
}

function getFeesGroupedByMonth(familyId: number) {
  const feesByMonthMap = getFeesMapByMonth(familyId);
  console.log('Fees for family', familyId, feesByMonthMap);

  const feesByMonth = Object.entries(feesByMonthMap).map(([_, value]) => ({
    month: value.month,
    fees: value.price,
  }));

  return feesByMonth;
}

function getAdditionalFees(familyId: number): AdditionalFeesRecord[] {
  // get all students that belong to a particular family using familyId
  const studentsData = getSheetByName<StudentEntry>('Students');

  console.log('Getting attendance for family', familyId);

  const studentsInFamily: StudentRecord[] = studentsData
    .slice(1)
    .filter(row => row[2] === familyId)
    .map(row => ({ StudentId: row[0], StudentName: row[1] }));

  console.log('Students in family', familyId, 'are', studentsInFamily);

  // get attendance for each student in the family
  const additionalFeesData =
    getSheetByName<AdditionalFeesEntry>('AdditionalFees');

  return additionalFeesData
    .slice(1)
    .reduce(
      (
        prev: AdditionalFeesRecord[],
        [feeId, studentId, date, notes, price]
      ) => {
        const student = studentsInFamily.find(s => s.StudentId === studentId);

        if (student) {
          prev.push({
            feeId,
            studentId,
            studentName: student.StudentName,
            date: new Date(date).toLocaleDateString(),
            notes,
            price,
          });
        }

        return prev;
      },
      []
    )
    .sort(({ date: classDateA }, { date: classDateB }) => {
      return Date.parse(classDateB) - Date.parse(classDateA);
    });
}

function getBalance(familyId: number): number {
  let balance = 0;
  const currentMonth = new Date().getMonth();

  // Balance is calculated using following formula:
  // Get family fees for all months till current month PLUS
  // All additional fees > 0 MINUS
  // All payments made so far

  const recentPayments = getRecentPaymentsByFamily(familyId);
  const additionalFees = getAdditionalFees(familyId);
  const feesByMonthMap = getFeesMapByMonth(familyId);

  // Add up all the monthly fees up to current month
  const classFees = Object.entries(feesByMonthMap).reduce(
    (acc, [month, fee]) => {
      if (currentMonth >= Number(month)) {
        acc += fee.price;
      }

      return acc;
    },
    0
  );

  const paymentTotal = recentPayments.reduce((paymentTotal, payment) => {
    paymentTotal += Number(payment.AmountPaid);
    return paymentTotal;
  }, 0);

  // Add up all the additional charges
  // These charges will be positive values in the additional fees sheet
  const additionalFeesTotal = additionalFees.reduce(
    (additionalFeesTotal, additionalFeeRecord) => {
      const additionalFee = Number(additionalFeeRecord.price);
      additionalFeesTotal += additionalFee;
      return additionalFeesTotal;
    },
    0
  );

  balance = Math.max(classFees + additionalFeesTotal - paymentTotal, 0);

  return balance;
}

function getAllData(familyId: number) {
  return {
    recentAttendance: getRecentAttendanceByFamily(familyId),
    recentPayments: getRecentPaymentsByFamily(familyId),
    upcomingClasses: getUpcomingClassesByFamily(familyId),
    additionalFees: getAdditionalFees(familyId),
  };
}
