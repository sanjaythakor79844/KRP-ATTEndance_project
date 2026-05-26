import mongoService from './mongoService.js';

class PastRecordsService {
  getRecordDate(record) {
    if (record.date) return record.date;
    return new Date(record.timestamp).toISOString().split('T')[0];
  }

  dedupeRecords(records) {
    const uniqueRecords = new Map();
    records.forEach((record) => {
      const recordDate = this.getRecordDate(record);
      const existing = uniqueRecords.get(recordDate);
      if (!existing || new Date(record.timestamp) > new Date(existing.timestamp)) {
        uniqueRecords.set(recordDate, record);
      }
    });
    return Array.from(uniqueRecords.values());
  }

  getMonthKey(dateStr) {
    const d = new Date(dateStr + 'T12:00:00.000Z');
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  formatMonthLabel(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getAttendanceStatusLabel(percentage) {
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Low';
  }

  aggregateMonthRecords(monthRecords) {
    const totalClasses = monthRecords.length;
    const classesAttended = monthRecords.filter(
      (r) => r.status === 'present' || r.status === 'late'
    ).length;
    const classesMissed = monthRecords.filter((r) => r.status === 'absent').length;
    const attendancePercentage =
      totalClasses > 0
        ? Math.round((classesAttended / totalClasses) * 1000) / 10
        : 0;

    return {
      totalClasses,
      classesAttended,
      classesMissed,
      attendancePercentage,
      status: this.getAttendanceStatusLabel(attendancePercentage),
    };
  }

  buildMonthRow(monthKey, monthRecords) {
    const stats = this.aggregateMonthRecords(monthRecords);
    return {
      month: monthKey,
      monthLabel: this.formatMonthLabel(monthKey),
      ...stats,
      dailyRecords: monthRecords
        .map((r) => ({
          date: this.getRecordDate(r),
          status: r.status,
          displayStatus:
            r.status === 'present'
              ? 'Present'
              : r.status === 'late'
                ? 'Late'
                : r.status === 'absent'
                  ? 'Absent'
                  : 'Leave',
          className: r.className || 'General Class',
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  buildTotalsRow(label, months) {
    const totalClasses = months.reduce((sum, m) => sum + m.totalClasses, 0);
    const classesAttended = months.reduce((sum, m) => sum + m.classesAttended, 0);
    const classesMissed = months.reduce((sum, m) => sum + m.classesMissed, 0);
    const attendancePercentage =
      totalClasses > 0
        ? Math.round((classesAttended / totalClasses) * 1000) / 10
        : 0;

    return {
      label,
      totalClasses,
      classesAttended,
      classesMissed,
      attendancePercentage,
      averageAttendancePercentage: attendancePercentage,
      status: this.getAttendanceStatusLabel(attendancePercentage),
      monthCount: months.length,
    };
  }

  async getStudentAttendanceRecords(studentId) {
    const all = await mongoService.getAttendance();
    return this.dedupeRecords(all.filter((r) => r.studentId === studentId));
  }

  async getMonthlySummary(studentId, options = {}) {
    const { fromMonth = null, toMonth = null, filterMode = 'default' } = options;

    const records = await this.getStudentAttendanceRecords(studentId);

    if (records.length === 0) {
      return {
        months: [],
        rangeTotals: this.buildTotalsRow('Total', []),
        termSummary: {
          label: 'Full Term',
          totalClasses: 0,
          classesAttended: 0,
          classesMissed: 0,
          attendancePercentage: 0,
          averageAttendancePercentage: 0,
          status: 'Low',
          monthCount: 0,
          firstMonth: null,
          lastMonth: null,
          firstMonthLabel: null,
          lastMonthLabel: null,
        },
        availableMonths: [],
      };
    }

    const byMonth = new Map();
    records.forEach((record) => {
      const monthKey = this.getMonthKey(this.getRecordDate(record));
      if (!byMonth.has(monthKey)) byMonth.set(monthKey, []);
      byMonth.get(monthKey).push(record);
    });

    const allMonthKeys = Array.from(byMonth.keys()).sort();
    const firstMonth = allMonthKeys[0];
    const lastMonth = allMonthKeys[allMonthKeys.length - 1];

    let selectedMonthKeys = allMonthKeys;

    if (filterMode === 'term') {
      selectedMonthKeys = allMonthKeys;
    } else if (fromMonth || toMonth) {
      const from = fromMonth || allMonthKeys[0];
      const to = toMonth || allMonthKeys[allMonthKeys.length - 1];
      selectedMonthKeys = allMonthKeys.filter((m) => m >= from && m <= to);
    } else {
      selectedMonthKeys = allMonthKeys.slice(-6);
    }

    const months = selectedMonthKeys.map((monthKey) =>
      this.buildMonthRow(monthKey, byMonth.get(monthKey))
    );

    const termMonths = allMonthKeys.map((monthKey) =>
      this.buildMonthRow(monthKey, byMonth.get(monthKey))
    );

    return {
      months,
      rangeTotals: this.buildTotalsRow('Total (Selected Range)', months),
      termSummary: {
        ...this.buildTotalsRow('Full Term', termMonths),
        firstMonth,
        lastMonth,
        firstMonthLabel: this.formatMonthLabel(firstMonth),
        lastMonthLabel: this.formatMonthLabel(lastMonth),
      },
      availableMonths: allMonthKeys.map((key) => ({
        value: key,
        label: this.formatMonthLabel(key),
      })),
    };
  }

  async logRecordsAccess(action, details, userId = 'admin') {
    await mongoService.addLog({
      action,
      details,
      userId,
      category: 'past_records_audit',
    });
  }
}

const pastRecordsService = new PastRecordsService();
export default pastRecordsService;
