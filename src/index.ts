/**
 * Copyright 2024 Elevation Beats Inc
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
} from './types/types';

const SPREADSHEET_ID: string =
  PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '';

const SHEETS = {
  FAMILIES: 'Families',
  STUDENTS: 'Students',
  ATTENDANCE: 'Attendance',
  PAYMENTS: 'Payments',
  CLASSES: 'Classes',
  CLASS_GROUPS: 'ClassGroups',
};

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
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} Google sheet reference
 */
function getSheetByName(sheetName: string): GoogleAppsScript.Spreadsheet.Sheet {
  const sheet =
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet with name ${sheetName} not found.`);
  }
  return sheet;
}

/**
 * Retrieves a list of all families with their IDs and names from the Families google sheet.
 * @returns {Array<FamilyRow>} Array of objects containing family IDs and names.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
function getFamilies(): Array<FamilyRecord> {
  const familiesSheet = getSheetByName(SHEETS.FAMILIES);
  const data = familiesSheet.getDataRange().getValues();
  return data.slice(1).map(row => ({ FamilyId: row[0], FamilyName: row[1] }));
}

/**
 * Retrieves a list of recent student attendence for a given familiy
 * @param {string} familyId ID of the family to retrieve recent attendance for
 * @returns {Array<RecentAttendance>} Array of objects containing family IDs and names.
 */
function getRecentAttendanceByFamily(
  familyId: string
): Array<RecentAttendance> {
  // get all students that belong to a particular family using familyId
  const studentsSheet = getSheetByName(SHEETS.STUDENTS);
  const studentsData = studentsSheet.getDataRange().getValues();

  const studentsInFamily: StudentRecord[] = studentsData
    .slice(1)
    .filter(row => row[2] === familyId)
    .map(row => ({ StudentId: row[0], StudentName: row[1] }));

  // get attendance for each student in the family
  const attendanceSheet = getSheetByName(SHEETS.ATTENDANCE);
  const attendanceData = attendanceSheet.getDataRange().getValues();
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
      Price: row[4],
    }));

  // get class details for each attendance
  const classSheet = getSheetByName(SHEETS.CLASSES);
  const classData = classSheet.getDataRange().getValues();
  const classGroupSheet = getSheetByName(SHEETS.CLASS_GROUPS);
  const classGroupData = classGroupSheet.getDataRange().getValues();

  return attendanceInFamily.map(attendance => {
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

    return {
      AttendanceId: attendance.AttendanceId,
      ClassDate: classDetails[2],
      StudentName: attendance.StudentName || '',
      ClassGroupName: classGroupDetails[1],
      Price: attendance.Price,
    };
  });
}

/*
"Create function to get a list of recent payments based on family ID selection.
Input: familyID
Output: [{ paymentID, paymentDate, paymentAmount }]"
*/
function getRecentPaymentsByFamily(familyId: string) {
  const paymentsSheet = getSheetByName(SHEETS.PAYMENTS);
  const paymentsData = paymentsSheet.getDataRange().getValues();
  return paymentsData
    .slice(1)
    .filter(row => row[1] === familyId)
    .map(row => ({
      PaymentId: row[0],
      PaymentDate: row[2],
      AmountPaid: row[3],
    }));
}

/**
 * "Create a function to get a list of upcoming classes based on family ID selection.
Input: familyID
Output: [{ classID, classDate, classGroupName, amount }]"

 * 1. Get a list of students where familyID = input.familyID AND active = true
2. From the list of students, get the unique list of class group IDs
3. Get a list of classes from Class where
classGroupID in array of classGroupIDs from step #2
4. Join class & classGroup to get classID, classDate, classGroupName, (class.amount OR classGroup.amount)


 */
function getUpcomingClassesByFamily(familyId: string) {
  // Get a list of students where familyID = input.familyID AND active = true
  const studentsSheet = getSheetByName(SHEETS.STUDENTS);
  const studentsData = studentsSheet.getDataRange().getValues();
  const uniqueClassGroupIds: number[] = Array.from(
    new Set(
      studentsData
        .slice(1)
        .filter(row => row[2] === familyId && row[4] === true)
        .map(row => row[3])
    )
  );

  // Get a list of classes from Class where classGroupID in array of classGroupIDs from uniqueClassGroupIds
  const classesData = getSheetByName(SHEETS.CLASSES).getDataRange().getValues();
  const classGroupsData = getSheetByName(SHEETS.CLASS_GROUPS)
    .getDataRange()
    .getValues();
  const today = new Date();
  const isUpcomingClass = (row: number[]): boolean => {
    const classDate = new Date(row[2]);
    return uniqueClassGroupIds.includes(row[1]) && classDate >= today;
  };
  return classesData
    .slice(1)
    .filter(isUpcomingClass)
    .map(row => ({
      ClassId: row[0],
      ClassDate: row[2],
      ClassGroupName: classGroupsData.slice(1)[row[1]][1], // get from ClassGroup sheet row[1]
      Price: row[3] !== '' ? row[3] : classGroupsData.slice(1)[row[1]][2], // get from ClassGroup sheet row[1]
    }));
}
