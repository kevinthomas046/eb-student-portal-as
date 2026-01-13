export interface FamilyRecord {
    FamilyId: number;
    FamilyName: string;
}
export interface RecentAttendance {
    AttendanceId: number;
    ClassId: number;
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
export type Sheet = 'Families' | 'Students' | 'Attendance' | 'Payments' | 'Classes' | 'ClassGroups' | 'AdditionalFees';
export type FamilyEntry = [familyId: number, FamilyName: string];
export type StudentEntry = [
    studentId: number,
    StudentName: string,
    familyId: number,
    classGroupId: number,
    Active: boolean,
    StartDate: string,
    EndDate: string
];
export type AdditionalFeesEntry = [
    feeID: number,
    studentID: number,
    Date: string,
    Notes: string,
    Price: number
];
export type AttendanceEntry = [
    attendanceId: number,
    studentId: number,
    classId: number,
    Notes: string,
    Price: number
];
export type ClassEntry = [
    classId: number,
    classGroupId: number,
    Date: string,
    Price: number,
    Cancelled: boolean
];
export type PaymentEntry = [
    paymentId: number,
    familyId: number,
    PaymentDate: string,
    amountPaid: number
];
export type ClassGroupEntry = [
    classGroupId: number,
    ClassGroupName: string,
    PricePerClass: number
];
