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
// types.ts
export interface FamilyRecord {
  FamilyId: number;
  FamilyName: string;
}

export interface RecentAttendance {
  AttendanceId: number;
  ClassDate: string;
  StudentName: string;
  ClassGroupName: string;
  Price: string;
}

export interface PaymentRecord {
  PaymentId: number;
  PaymentDate: string;
  AmountPaid: number;
}

export interface StudentRecord {
  StudentId: number;
  StudentName: string;
}

export interface AttendanceRecord {
  AttendanceId: number;
  ClassId: number;
  StudentName: string | undefined;
  Price: string;
}

export interface AdditionalFeesRecord {
  feeId: number;
  studentId: number;
  studentName: string;
  date: string;
  notes: string;
  price: number;
}

export type Sheet =
  | 'Families'
  | 'Students'
  | 'Attendance'
  | 'Payments'
  | 'Classes'
  | 'ClassGroups'
  | 'AdditionalFees';

export type FamilyEntry = [familyId: number, FamilyName: string];
export type StudentEntry = [
  studentId: number,
  StudentName: string,
  familyId: number,
  classGroupId: number,
  Active: boolean,
];
export type AdditionalFeesEntry = [
  feeID: number,
  studentID: number,
  Date: string,
  Notes: string,
  Price: number,
];
export type AttendanceEntry = [
  attendanceId: number,
  studentId: number,
  classId: number,
  Notes: string,
  Price: number,
];
export type ClassEntry = [
  classId: number,
  classGroupId: number,
  Date: string,
  Price: number,
];
export type PaymentEntry = [
  paymentId: number,
  familyId: number,
  PaymentDate: string,
  amountPaid: number,
];
export type ClassGroupEntry = [
  classGroupId: number,
  ClassGroupName: string,
  PricePerClass: number,
];
