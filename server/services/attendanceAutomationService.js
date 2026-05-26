// Attendance automation service for instructors
class AttendanceAutomationService {
    constructor() {
        this.activeAttendanceSessions = new Map();
        this.instructorNumbers = new Map(); // Map of instructor IDs to phone numbers
    }

    async registerInstructor(instructorId, phone, name, course, batch) {
        try {
            this.instructorNumbers.set(instructorId, {
                phone,
                name,
                course,
                batch
            });
            
            await mongoService.addLog({
                type: 'instructor_registered',
                instructorId,
                name,
                phone,
                course,
                batch,
                registeredAt: new Date().toISOString()
            });
            
            return { success: true, message: 'Instructor registered successfully' };
        } catch (error) {
            console.error('Error registering instructor:', error);
            return { success: false, error: error.message };
        }
    }

    async startAttendanceSession(instructorId, sessionData) {
        try {
            const instructor = this.instructorNumbers.get(instructorId);
            if (!instructor) {
                return { success: false, error: 'Instructor not found' };
            }

            const sessionId = Date.now().toString();
            const session = {
                id: sessionId,
                instructorId,
                instructor: instructor.name,
                course: instructor.course,
                batch: instructor.batch,
                date: sessionData.date || new Date().toISOString().split('T')[0],
                time: sessionData.time || new Date().toTimeString().split(' ')[0],
                location: sessionData.location || 'Classroom',
                startTime: new Date().toISOString(),
                status: 'active',
                attendees: [],
                nonAttendees: [],
                totalStudents: 0
            };

            this.activeAttendanceSessions.set(sessionId, session);

            // Get students for this batch/course
            const students = await mongoService.getStudents();
            const targetStudents = students.filter(s => 
                s.batch === instructor.batch || s.course === instructor.course
            );

            session.totalStudents = targetStudents.length;

            // Send attendance request to instructor
            const message = this.generateAttendanceRequestMessage(session, targetStudents);
            await backupMessagingService.sendMessage(instructor.phone, message);

            return {
                success: true,
                sessionId,
                message: 'Attendance session started',
                data: {
                    totalStudents: targetStudents.length,
                    instructor: instructor.name,
                    course: instructor.course,
                    batch: instructor.batch
                }
            };
        } catch (error) {
            console.error('Error starting attendance session:', error);
            return { success: false, error: error.message };
        }
    }

    generateAttendanceRequestMessage(session, students) {
        const studentList = students.map(s => `${s.name} (${s.phone})`).join('\n');
        
        return `📋 Attendance Request - ${session.course}\n\n` +
               `Instructor: ${session.instructor}\n` +
               `Date: ${session.date}\n` +
               `Time: ${session.time}\n` +
               `Location: ${session.location}\n` +
               `Total Students: ${students.length}\n\n` +
               `📝 Student List:\n${studentList}\n\n` +
               `Please respond with attendance in this format:\n\n` +
               `ATTENDANCE:\n` +
               `Attendees: Student1, Student2, Student3\n` +
               `Non-attendees: Student4, Student5\n\n` +
               `Type "ATTENDANCE:" followed by the lists.\n` +
               `This session will expire in 2 hours.`;
    }

    async processAttendanceResponse(instructorId, message) {
        try {
            // Find active session for this instructor
            let activeSession = null;
            let sessionId = null;
            
            for (const [sid, session] of this.activeAttendanceSessions.entries()) {
                if (session.instructorId === instructorId && session.status === 'active') {
                    activeSession = session;
                    sessionId = sid;
                    break;
                }
            }

            if (!activeSession) {
                return { success: false, error: 'No active attendance session found' };
            }

            // Parse attendance response
            const parsed = this.parseAttendanceMessage(message);
            if (!parsed) {
                return { success: false, error: 'Invalid format. Please use: ATTENDANCE:\\nAttendees: name1, name2\\nNon-attendees: name3, name4' };
            }

            // Get students for this session
            const students = await mongoService.getStudents();
            const targetStudents = students.filter(s => 
                s.batch === activeSession.batch || s.course === activeSession.course
            );

            // Process attendees
            const attendees = [];
            const nonAttendees = [];
            const unmarked = [];

            for (const student of targetStudents) {
                const studentName = student.name.trim();
                
                if (parsed.attendees.includes(studentName)) {
                    attendees.push(student);
                    await this.markAttendance(student.id, 'present', activeSession);
                } else if (parsed.nonAttendees.includes(studentName)) {
                    nonAttendees.push(student);
                    await this.markAttendance(student.id, 'absent', activeSession);
                } else {
                    unmarked.push(student);
                    await this.markAttendance(student.id, 'unmarked', activeSession);
                }
            }

            // Update session
            activeSession.attendees = attendees;
            activeSession.nonAttendees = nonAttendees;
            activeSession.unmarked = unmarked;
            activeSession.endTime = new Date().toISOString();
            activeSession.status = 'completed';

            // Calculate statistics
            const presentCount = attendees.length;
            const absentCount = nonAttendees.length;
            const unmarkedCount = unmarked.length;
            const attendanceRate = targetStudents.length > 0 ? Math.round((presentCount / targetStudents.length) * 100) : 0;

            // Send confirmation to instructor
            const confirmationMessage = `✅ Attendance Recorded Successfully\n\n` +
                                       `Course: ${activeSession.course}\n` +
                                       `Date: ${activeSession.date}\n` +
                                       `Time: ${activeSession.time}\n\n` +
                                       `📊 Summary:\n` +
                                       `Present: ${presentCount}\n` +
                                       `Absent: ${absentCount}\n` +
                                       `Unmarked: ${unmarkedCount}\n` +
                                       `Attendance Rate: ${attendanceRate}%\n\n` +
                                       `Session completed.`;

            await backupMessagingService.sendMessage(this.instructorNumbers.get(instructorId).phone, confirmationMessage);

            // Send notifications to absent students
            for (const absentStudent of nonAttendees) {
                await this.sendAbsentNotification(absentStudent, activeSession);
            }

            // Log the session
            await mongoService.addLog({
                type: 'attendance_session_completed',
                sessionId,
                instructorId,
                instructor: activeSession.instructor,
                course: activeSession.course,
                batch: activeSession.batch,
                date: activeSession.date,
                time: activeSession.time,
                presentCount,
                absentCount,
                unmarkedCount,
                attendanceRate,
                completedAt: new Date().toISOString()
            });

            return {
                success: true,
                message: 'Attendance processed successfully',
                data: {
                    sessionId,
                    presentCount,
                    absentCount,
                    unmarkedCount,
                    attendanceRate,
                    details: {
                        attendees: attendees.map(s => s.name),
                        nonAttendees: nonAttendees.map(s => s.name),
                        unmarked: unmarked.map(s => s.name)
                    }
                }
            };
        } catch (error) {
            console.error('Error processing attendance response:', error);
            return { success: false, error: error.message };
        }
    }

    parseAttendanceMessage(message) {
        try {
            // Look for "ATTENDANCE:" keyword
            const attendanceIndex = message.toUpperCase().indexOf('ATTENDANCE:');
            if (attendanceIndex === -1) {
                return null;
            }

            const attendanceSection = message.substring(attendanceIndex);
            
            // Extract attendees
            const attendeesMatch = attendanceSection.match(/ATTENDEES:\s*([^\n]+)/i);
            const attendees = attendeesMatch ? 
                attendeesMatch[1].split(',').map(name => name.trim()).filter(name => name) : [];

            // Extract non-attendees
            const nonAttendeesMatch = attendanceSection.match(/NON[-\s]?ATTENDEES:\s*([^\n]+)/i);
            const nonAttendees = nonAttendeesMatch ? 
                nonAttendeesMatch[1].split(',').map(name => name.trim()).filter(name => name) : [];

            return { attendees, nonAttendees };
        } catch (error) {
            console.error('Error parsing attendance message:', error);
            return null;
        }
    }

    async markAttendance(studentId, status, session) {
        try {
            await mongoService.addAttendance({
                studentId,
                status,
                sessionId: session.id,
                course: session.course,
                batch: session.batch,
                instructor: session.instructor,
                date: session.date,
                time: session.time,
                location: session.location,
                markedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    }

    async sendAbsentNotification(student, session) {
        try {
            const message = `📢 Attendance Notification\n\n` +
                           `Hi ${student.name},\n\n` +
                           `You were marked absent for today's class:\n\n` +
                           `Course: ${session.course}\n` +
                           `Date: ${session.date}\n` +
                           `Time: ${session.time}\n` +
                           `Location: ${session.location}\n` +
                           `Instructor: ${session.instructor}\n\n` +
                           `If this was a mistake, please contact your instructor.\n` +
                           `Regular attendance is important for your progress.`;

            await backupMessagingService.sendMessage(student.phone, message);
        } catch (error) {
            console.error('Error sending absent notification:', error);
        }
    }

    async getAttendanceReport(filters = {}) {
        try {
            const attendance = await mongoService.getAttendance();
            let filteredAttendance = attendance;

            // Apply filters
            if (filters.course) {
                filteredAttendance = filteredAttendance.filter(a => a.course === filters.course);
            }
            if (filters.batch) {
                filteredAttendance = filteredAttendance.filter(a => a.batch === filters.batch);
            }
            if (filters.date) {
                filteredAttendance = filteredAttendance.filter(a => a.date === filters.date);
            }
            if (filters.instructor) {
                filteredAttendance = filteredAttendance.filter(a => a.instructor === filters.instructor);
            }
            if (filters.startDate && filters.endDate) {
                filteredAttendance = filteredAttendance.filter(a => 
                    a.date >= filters.startDate && a.date <= filters.endDate
                );
            }

            // Calculate statistics
            const students = await mongoService.getStudents();
            const report = {
                totalRecords: filteredAttendance.length,
                present: filteredAttendance.filter(a => a.status === 'present').length,
                absent: filteredAttendance.filter(a => a.status === 'absent').length,
                unmarked: filteredAttendance.filter(a => a.status === 'unmarked').length,
                attendanceRate: filteredAttendance.length > 0 ? 
                    Math.round((filteredAttendance.filter(a => a.status === 'present').length / filteredAttendance.length) * 100) : 0,
                details: filteredAttendance.map(record => {
                    const student = students.find(s => s.id === record.studentId);
                    return {
                        ...record,
                        studentName: student?.name || 'Unknown',
                        phone: student?.phone || 'Unknown'
                    };
                })
            };

            return report;
        } catch (error) {
            console.error('Error getting attendance report:', error);
            throw error;
        }
    }

    async getStudentAttendanceReport(studentId, startDate, endDate) {
        try {
            const attendance = await mongoService.getAttendance();
            const studentAttendance = attendance.filter(a => a.studentId === studentId);
            
            let filteredAttendance = studentAttendance;
            if (startDate && endDate) {
                filteredAttendance = studentAttendance.filter(a => 
                    a.date >= startDate && a.date <= endDate
                );
            }

            const total = filteredAttendance.length;
            const present = filteredAttendance.filter(a => a.status === 'present').length;
            const absent = filteredAttendance.filter(a => a.status === 'absent').length;
            const unmarked = filteredAttendance.filter(a => a.status === 'unmarked').length;
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

            return {
                studentId,
                total,
                present,
                absent,
                unmarked,
                percentage,
                records: filteredAttendance
            };
        } catch (error) {
            console.error('Error getting student attendance report:', error);
            throw error;
        }
    }

    async getInstructorStats(instructorId) {
        try {
            const attendance = await mongoService.getAttendance();
            const instructorAttendance = attendance.filter(a => a.instructorId === instructorId);
            
            const sessions = {};
            instructorAttendance.forEach(record => {
                const sessionKey = `${record.date}-${record.time}`;
                if (!sessions[sessionKey]) {
                    sessions[sessionKey] = {
                        date: record.date,
                        time: record.time,
                        course: record.course,
                        batch: record.batch,
                        totalStudents: 0,
                        present: 0,
                        absent: 0,
                        unmarked: 0
                    };
                }
                sessions[sessionKey].totalStudents++;
                if (record.status === 'present') sessions[sessionKey].present++;
                else if (record.status === 'absent') sessions[sessionKey].absent++;
                else if (record.status === 'unmarked') sessions[sessionKey].unmarked++;
            });

            const sessionArray = Object.values(sessions);
            const totalSessions = sessionArray.length;
            const avgAttendanceRate = sessionArray.length > 0 ? 
                Math.round(sessionArray.reduce((sum, s) => sum + (s.totalStudents > 0 ? (s.present / s.totalStudents) * 100 : 0), 0) / totalSessions) : 0;

            return {
                instructorId,
                totalSessions,
                avgAttendanceRate,
                sessions: sessionArray
            };
        } catch (error) {
            console.error('Error getting instructor stats:', error);
            throw error;
        }
    }

    async cleanupExpiredSessions() {
        try {
            const now = new Date();
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            
            for (const [sessionId, session] of this.activeAttendanceSessions.entries()) {
                if (new Date(session.startTime) < twoHoursAgo && session.status === 'active') {
                    session.status = 'expired';
                    session.endTime = new Date().toISOString();
                    
                    await mongoService.addLog({
                        type: 'attendance_session_expired',
                        sessionId,
                        instructorId: session.instructorId,
                        instructor: session.instructor,
                        course: session.course,
                        batch: session.batch,
                        date: session.date,
                        time: session.time,
                        expiredAt: new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
        }
    }

    getActiveSessions() {
        return Array.from(this.activeAttendanceSessions.entries()).map(([id, session]) => ({
            sessionId: id,
            ...session
        }));
    }

    getRegisteredInstructors() {
        return Array.from(this.instructorNumbers.entries()).map(([id, info]) => ({
            instructorId: id,
            ...info
        }));
    }
}

const attendanceAutomationService = new AttendanceAutomationService();

export default attendanceAutomationService;
