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

  mapMonthToClient(monthRow) {
    const daily = monthRow.dailyRecords || [];
    const present = daily.filter((d) => d.status === 'present').length;
    const absent = daily.filter((d) => d.status === 'absent').length;
    const late = daily.filter((d) => d.status === 'late').length;

    return {
      month: monthRow.month,
      monthName: monthRow.monthLabel,
      totalClasses: monthRow.totalClasses,
      classesAttended: monthRow.classesAttended,
      classesMissed: monthRow.classesMissed,
      present,
      absent,
      late,
      percentage: monthRow.attendancePercentage,
      status: monthRow.status,
    };
  }

  buildTotalTerm(termMonths, termSummary) {
    const monthlySummary = termMonths.map((m) => this.mapMonthToClient(m));
    const allDaily = termMonths.flatMap((m) => m.dailyRecords || []);

    const totalPresent = allDaily.filter((d) => d.status === 'present').length;
    const totalLate = allDaily.filter((d) => d.status === 'late').length;
    const totalAbsent = allDaily.filter((d) => d.status === 'absent').length;

    const avgMonthlyPercentage =
      monthlySummary.length > 0
        ? Math.round(
            (monthlySummary.reduce((sum, m) => sum + m.percentage, 0) / monthlySummary.length) * 10
          ) / 10
        : 0;

    return {
      firstMonth: termSummary.firstMonthLabel || 'N/A',
      lastMonth: termSummary.lastMonthLabel || 'N/A',
      totalClasses: termSummary.totalClasses,
      totalAttended: termSummary.classesAttended,
      totalPresent,
      totalAbsent,
      totalLate,
      totalPercentage: termSummary.attendancePercentage,
      avgMonthlyPercentage,
      status: termSummary.status,
    };
  }

  buildStatsFromMonths(monthRows, totalsMeta = {}) {
    const monthlySummary = monthRows.map((m) => this.mapMonthToClient(m));
    const allDaily = monthRows.flatMap((m) => m.dailyRecords || []);
    const totalPresent = allDaily.filter((d) => d.status === 'present').length;
    const totalLate = allDaily.filter((d) => d.status === 'late').length;
    const totalAbsent = allDaily.filter((d) => d.status === 'absent').length;
    const totalClasses = totalsMeta.totalClasses ?? monthRows.reduce((s, m) => s + m.totalClasses, 0);
    const totalAttended = totalsMeta.classesAttended ?? monthRows.reduce((s, m) => s + m.classesAttended, 0);
    const totalPercentage =
      totalsMeta.attendancePercentage ??
      (totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 0);
    const avgMonthlyPercentage =
      monthlySummary.length > 0
        ? Math.round(
            (monthlySummary.reduce((sum, m) => sum + m.percentage, 0) / monthlySummary.length) * 10
          ) / 10
        : 0;

    return {
      firstMonth: totalsMeta.firstMonthLabel || (monthRows[0] ? monthRows[0].monthLabel : 'N/A'),
      lastMonth:
        totalsMeta.lastMonthLabel ||
        (monthRows.length ? monthRows[monthRows.length - 1].monthLabel : 'N/A'),
      totalClasses,
      totalAttended,
      totalPresent,
      totalAbsent,
      totalLate,
      totalPercentage,
      avgMonthlyPercentage,
      status: totalsMeta.status || this.getAttendanceStatusLabel(totalPercentage),
      monthCount: monthRows.length,
    };
  }

  async getClientAttendanceSummary(studentId, options = {}) {
    const student = await mongoService.getStudentById(studentId);
    if (!student) return null;

    const filterMode = options.filterMode || 'default';
    const summary = await this.getMonthlySummary(studentId, {
      fromMonth: options.fromMonth || null,
      toMonth: options.toMonth || null,
      filterMode,
    });

    const termSummaryData = await this.getMonthlySummary(studentId, { filterMode: 'term' });

    const totalTerm = this.buildTotalTerm(termSummaryData.months, termSummaryData.termSummary);
    const selectedRange =
      filterMode === 'term'
        ? totalTerm
        : this.buildStatsFromMonths(summary.months, {
            ...summary.rangeTotals,
            firstMonthLabel: summary.months[0]?.monthLabel,
            lastMonthLabel: summary.months[summary.months.length - 1]?.monthLabel,
          });

    return {
      student: {
        id: student.id,
        name: student.name,
        email: student.email || '',
        batch: student.batch || '—',
        deactivatedAt: student.deactivatedAt,
      },
      monthlySummary: summary.months.map((m) => this.mapMonthToClient(m)),
      totalTerm,
      selectedRange,
      filterMode,
      filterLabel:
        filterMode === 'term'
          ? `Full Term (${totalTerm.firstMonth} — ${totalTerm.lastMonth})`
          : filterMode === 'range'
            ? `Range (${selectedRange.firstMonth} — ${selectedRange.lastMonth})`
            : 'Last 6 months',
      months: summary.months,
      rangeTotals: summary.rangeTotals,
      termSummary: summary.termSummary,
      availableMonths: summary.availableMonths,
      readOnly: true,
    };
  }

  async getBatchAttendanceSummary(batch, options = {}) {
    const filterMode = options.filterMode || 'term';
    const allPast = await mongoService.getPastStudents();
    const batchStudents =
      batch && batch !== 'all'
        ? allPast.filter((s) => (s.batch || '—') === batch)
        : allPast;

    const studentStats = [];
    let totalClasses = 0;
    let totalAttended = 0;
    let totalAbsent = 0;
    let totalPresent = 0;
    let totalLate = 0;
    const percentageSum = [];
    let periodFrom = 'N/A';
    let periodTo = 'N/A';

    for (const student of batchStudents) {
      const summary = await this.getMonthlySummary(student.id, {
        fromMonth: options.fromMonth || null,
        toMonth: options.toMonth || null,
        filterMode,
      });

      let rowStats;
      if (filterMode === 'term') {
        const termData = await this.getMonthlySummary(student.id, { filterMode: 'term' });
        rowStats = this.buildTotalTerm(termData.months, termData.termSummary);
        if (termData.months.length && periodFrom === 'N/A') {
          periodFrom = termData.termSummary.firstMonthLabel;
          periodTo = termData.termSummary.lastMonthLabel;
        }
      } else {
        rowStats = this.buildStatsFromMonths(summary.months, {
          ...summary.rangeTotals,
          firstMonthLabel: summary.months[0]?.monthLabel,
          lastMonthLabel: summary.months[summary.months.length - 1]?.monthLabel,
        });
        if (summary.months.length && periodFrom === 'N/A') {
          periodFrom = summary.months[0].monthLabel;
          periodTo = summary.months[summary.months.length - 1].monthLabel;
        }
      }

      studentStats.push({
        id: student.id,
        name: student.name,
        email: student.email || '',
        batch: student.batch || '—',
        totalClasses: rowStats.totalClasses,
        totalAttended: rowStats.totalAttended,
        totalPercentage: rowStats.totalPercentage,
        avgMonthlyPercentage: rowStats.avgMonthlyPercentage,
        status: rowStats.status,
      });

      totalClasses += rowStats.totalClasses;
      totalAttended += rowStats.totalAttended;
      totalAbsent += rowStats.totalAbsent;
      totalPresent += rowStats.totalPresent;
      totalLate += rowStats.totalLate;
      if (rowStats.totalClasses > 0) percentageSum.push(rowStats.totalPercentage);
    }

    const batchPercentage =
      totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 0;
    const avgStudentPercentage =
      percentageSum.length > 0
        ? Math.round((percentageSum.reduce((a, b) => a + b, 0) / percentageSum.length) * 10) / 10
        : 0;

    return {
      batch: batch || 'all',
      studentCount: batchStudents.length,
      filterMode,
      filterLabel:
        filterMode === 'term'
          ? 'Full Term (first month to last month)'
          : options.fromMonth || options.toMonth
            ? `Range ${options.fromMonth || '…'} — ${options.toMonth || '…'}`
            : 'Last 6 months per student',
      period: { from: periodFrom, to: periodTo },
      aggregate: {
        totalClasses,
        totalAttended,
        totalPresent,
        totalAbsent,
        totalLate,
        totalPercentage: batchPercentage,
        avgStudentPercentage,
        status: this.getAttendanceStatusLabel(batchPercentage),
      },
      students: studentStats.sort((a, b) => b.totalPercentage - a.totalPercentage),
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
