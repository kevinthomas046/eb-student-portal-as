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
// types.ts
export interface FamilyRecord {
  FamilyId: string;
  FamilyName: string;
}

export interface RecentAttendance {
  AttendanceId: string;
  ClassDate: string;
  StudentName: string;
  ClassGroupName: string;
  Price: string;
}

export interface PaymentRecord {
  PaymentId: string;
  PaymentDate: string;
  AmountPaid: number;
}

export interface StudentRecord {
  StudentId: string;
  StudentName: string;
}

export interface AttendanceRecord {
  AttendanceId: string;
  ClassId: string;
  StudentName: string | undefined;
  Price: string;
}

export interface AdditionalFeesRecord {
  feeId: string;
  studentId: string;
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

export type FamilyEntry = [FamilyId: number, FamilyName: string];
export type StudentEntry = [
  StudentId: number,
  StudentName: string,
  FamilyId: number,
  ClassGroupId: number,
  Active: boolean,
];
export type AdditionalFeesEntry = [
  FeeID: number,
  StudentID: number,
  Date: string,
  Notes: string,
  Price: number,
];
export type AttendanceEntry = [
  AttendanceId: number,
  StudentId: number,
  ClassId: number,
  Notes: string,
  Price: number,
];
export type ClassEntry = [
  ClassId: number,
  ClassGroupId: number,
  Date: string,
  Price: number,
];
export type PaymentEntry = [
  PaymentId: number,
  FamilyId: number,
  PaymentDate: string,
  AmountPaid: number,
];
export type ClassGroupEntry = [
  ClassGroupId: number,
  ClassGroupName: string,
  PricePerClass: number,
];
