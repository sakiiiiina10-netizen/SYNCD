import { FeeSetup, FeePayment, Student } from './types';
import { UNITS, getFeeGroupForStudent } from './constants';

export function getDueDateForUnit(unitNumber: number, year: number): string {
  const dueRanges: Record<number, [number, number]> = {
    1: [4, 9],
    2: [7, 9],
    3: [10, 9],
    4: [1, 9],
  };
  const [month, day] = dueRanges[unitNumber] ?? [4, 9];
  const date = new Date(year, month, day, 23, 59, 59);
  return date.toISOString().split('T')[0];
}

export function calculateStudentFee(
  student: Student,
  feeSetups: FeeSetup[],
  payments: FeePayment[],
  year: number
): {
  totalExpected: number;
  totalPaid: number;
  totalPending: number;
  units: Array<{
    unit: number;
    expected: number;
    paid: number;
    fine: number;
    status: string;
    dueDate: string;
    paymentDate: string | null;
  }>;
} {
  const studentGroup = getFeeGroupForStudent(student.class, student.stream);

  const relevantSetups = feeSetups.filter((fs) => {
    if (fs.fee_group) {
      return fs.fee_group === studentGroup?.label && fs.fee_category === student.fee_category;
    }
    if (fs.class !== student.class) return false;
    if (fs.stream !== student.stream && !(fs.stream === null && student.stream === null)) return false;
    return fs.fee_category === student.fee_category;
  });

  let totalExpected = 0;
  let totalPaid = 0;

  const units = UNITS.map((unit) => {
    const setup = relevantSetups.find((fs) => fs.unit_number === unit.number);
    const setupDueDate = setup?.due_date ?? null;

    const unitPayment = payments.find(
      (p) => p.student_id === student.id && p.unit_number === unit.number && p.year === year
    );

    let expected: number;
    if (student.second_ward_discount && setup?.second_ward_amount != null) {
      expected = setup.second_ward_amount;
    } else {
      expected = setup?.amount ?? 0;
    }

    const paid = unitPayment?.amount_paid ?? 0;
    const fine = unitPayment?.fine_paid ?? 0;
    const expectedWithFine = expected + fine;
    let status = 'unpaid';

    if (unitPayment) {
      status = unitPayment.status;
    } else if (expected === 0) {
      status = 'unpaid';
    } else {
      status = 'pending';
    }

    totalExpected += expectedWithFine;
    totalPaid += paid;

    return {
      unit: unit.number,
      expected: expectedWithFine,
      paid,
      fine,
      status,
      dueDate: setupDueDate ?? unitPayment?.due_date ?? getDueDateForUnit(unit.number, year),
      paymentDate: unitPayment?.payment_date ?? null,
    };
  });

  return {
    totalExpected,
    totalPaid,
    totalPending: totalExpected - totalPaid,
    units,
  };
}

export function getOverallFeeStatus(
  feeData: ReturnType<typeof calculateStudentFee>
): string {
  if (feeData.totalExpected === 0) return 'unpaid';
  if (feeData.totalPaid >= feeData.totalExpected) return 'paid';
  if (feeData.totalPaid > 0) return 'partial';
  return 'pending';
}
