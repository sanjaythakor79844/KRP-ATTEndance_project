// MongoDB service for data persistence with fallback support
import { MongoClient, ObjectId } from 'mongodb';

class MongoService {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
        // Don't initialize URI in constructor - will be set in connect()
        this.uri = null;
        this.dbName = null;
        
        // Fallback in-memory data when MongoDB is not available
        this.fallbackData = {
            students: [
                { id: '1', _id: '1', name: 'Dakshi Kocharekar', email: 'dakshikocharekar6@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '2', _id: '2', name: 'Bhavna', email: 'bhavna.mail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '3', _id: '3', name: 'Shafaq', email: 'shafaqsultana@hotmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '4', _id: '4', name: 'Sarah', email: 'Sarahzakir91@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '5', _id: '5', name: 'Vaibhavi', email: 'Bhanavibhavi@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '6', _id: '6', name: 'Rishakha', email: 'Rishakhattri@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '7', _id: '7', name: 'Simran', email: 'd.simranbothra@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '8', _id: '8', name: 'Harshi', email: 'harshey.agarwal@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '9', _id: '9', name: 'Sangeeta', email: 'madamtutusingsoccer@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '10', _id: '10', name: 'Vrindanti', email: 'Ambrevadanti97@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '11', _id: '11', name: 'Mayra', email: 'Manmukunda|wal.978@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '12', _id: '12', name: 'Kanishka', email: 'kanishkasewairamani@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '13', _id: '13', name: 'Prachika', email: 'Mehtaprachika96@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '14', _id: '14', name: 'Aviva', email: '', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '15', _id: '15', name: 'Khushi', email: '', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ],
            attendanceManagers: [
                { id: 'mgr1', _id: 'mgr1', name: 'Kajol', email: 'teamkajolrpaswwan@gmail.com', role: 'manager', createdAt: new Date().toISOString() }
            ],
            projects: [],
            projectAssignments: [], // Track who was sent which project and their response
            attendance: [],
            logs: [],
            templates: [
                { id: '1', _id: '1', name: 'Attendance Reminder', content: '📋 Good morning! Please mark your attendance for today.\n\nLogin to dashboard and mark Present/Absent/Late for each student.\n\nThank you!', category: 'attendance', createdAt: new Date().toISOString() },
                { id: '2', _id: '2', name: 'Project Assignment', content: '📊 New project assigned to you!\n\nPlease check the dashboard for details and confirm your availability.\n\nThank you!', category: 'project', createdAt: new Date().toISOString() },
                { id: '3', _id: '3', name: 'Weekly Report', content: '📈 Weekly Report Request\n\nPlease submit your weekly progress report by end of day.\n\nThank you!', category: 'report', createdAt: new Date().toISOString() },
            ]
        };
    }

    async connect() {
        try {
            // Load URI from environment at connect time (not constructor time)
            this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
            this.dbName = process.env.DB_NAME || 'krp_academy';
            
            // Debug: Log the URI (hide password)
            const uriForLog = this.uri.replace(/:[^:@]+@/, ':****@');
            console.log(`🔍 Connecting to MongoDB...`);
            console.log(`   URI: ${uriForLog}`);
            console.log(`   DB: ${this.dbName}`);
            
            this.client = new MongoClient(this.uri);
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.isConnected = true;
            console.log('✅ Connected to MongoDB');
            
            // Create indexes if needed
            await this.createIndexes();
            
            // Initialize default data if database is empty
            await this.initializeDefaultData();
            
            return true;
        } catch (error) {
            console.error('⚠️ MongoDB connection error:', error.message);
            console.log('⚠️ Using fallback data - MongoDB is not available');
            console.log('💡 Data will not persist between restarts');
            this.isConnected = false;
            return false;
        }
    }

    async initializeDefaultData() {
        try {
            // Check if attendance managers exist
            const managersCount = await this.db.collection('attendanceManagers').countDocuments();
            
            if (managersCount === 0) {
                console.log('📝 Initializing default attendance manager...');
                await this.db.collection('attendanceManagers').insertOne({
                    id: 'mgr1',
                    _id: 'mgr1',
                    name: 'Kajol',
                    email: 'teamkajolrpaswwan@gmail.com',
                    phone: '',
                    role: 'manager',
                    createdAt: new Date().toISOString()
                });
                console.log('✅ Default manager added: Kajol');
            }
            
            // Check if students exist
            const studentsCount = await this.db.collection('students').countDocuments();
            
            if (studentsCount === 0) {
                console.log('📝 Initializing default students (Batch A)...');
                await this.db.collection('students').insertMany(this.fallbackData.students);
                console.log(`✅ Added ${this.fallbackData.students.length} students`);
            }
            
        } catch (error) {
            console.error('⚠️ Error initializing default data:', error.message);
        }
    }

    async createIndexes() {
        try {
            // First, try to drop the old phone index if it exists
            try {
                await this.db.collection('students').dropIndex('phone_1');
                console.log('✅ Dropped old phone_1 index');
            } catch (error) {
                // Index doesn't exist, that's fine
                if (error.codeName !== 'IndexNotFound') {
                    console.log('⚠️ Note: phone_1 index not found (already removed)');
                }
            }
            
            // Students collection indexes
            await this.db.collection('students').createIndex({ id: 1 }, { unique: true });
            await this.db.collection('students').createIndex({ status: 1, deactivatedAt: -1 });
            
            // Projects collection indexes
            await this.db.collection('projects').createIndex({ id: 1 }, { unique: true });
            await this.db.collection('projects').createIndex({ assignedTo: 1 });
            
            // Attendance collection indexes
            await this.db.collection('attendance').createIndex({ studentId: 1 });
            await this.db.collection('attendance').createIndex({ timestamp: -1 });
            
            // Logs collection indexes
            await this.db.collection('logs').createIndex({ timestamp: -1 });
            
            // Templates collection indexes
            await this.db.collection('templates').createIndex({ id: 1 }, { unique: true });
            
            console.log('✅ MongoDB indexes created');
        } catch (error) {
            console.error('⚠️ Error creating indexes:', error.message);
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            console.log('📴 Disconnected from MongoDB');
        }
    }

    // Helper to get next ID for fallback data
    getNextId(collection) {
        const items = this.fallbackData[collection];
        if (items.length === 0) return '1';
        const maxId = Math.max(...items.map(item => parseInt(item.id) || 0));
        return String(maxId + 1);
    }

    // Students CRUD operations
    async getStudents() {
        try {
            if (this.isConnected && this.db) {
                const students = await this.db.collection('students').find({}).toArray();
                return students.map(student => ({
                    ...student,
                    _id: student._id.toString()
                }));
            }
            // Fallback
            return this.fallbackData.students;
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            return this.fallbackData.students;
        }
    }

    async addStudent(studentData) {
        try {
            const student = {
                ...studentData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (this.isConnected && this.db) {
                const result = await this.db.collection('students').insertOne(student);
                return {
                    success: true,
                    data: { ...student, _id: result.insertedId.toString() }
                };
            }
            
            // Fallback
            student._id = this.getNextId('students');
            this.fallbackData.students.push(student);
            console.log('⚠️ Student added to fallback data (will be lost on restart)');
            return {
                success: true,
                data: student
            };
        } catch (error) {
            console.error('❌ Error adding student:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateStudent(id, updateData) {
        try {
            if (this.isConnected && this.db) {
                const result = await this.db.collection('students').updateOne(
                    { id: id },
                    { $set: { ...updateData, updatedAt: new Date().toISOString() } }
                );
                
                if (result.matchedCount === 0) {
                    return {
                        success: false,
                        error: 'Student not found'
                    };
                }
                
                return {
                    success: true,
                    message: 'Student updated successfully'
                };
            }
            
            // Fallback
            const index = this.fallbackData.students.findIndex(s => s.id === id);
            if (index !== -1) {
                this.fallbackData.students[index] = {
                    ...this.fallbackData.students[index],
                    ...updateData,
                    updatedAt: new Date().toISOString()
                };
                console.log('⚠️ Student updated in fallback data (will be lost on restart)');
                return {
                    success: true,
                    message: 'Student updated successfully'
                };
            }
            
            return {
                success: false,
                error: 'Student not found'
            };
        } catch (error) {
            console.error('❌ Error updating student:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Deactivate student and archive their data
    async deactivateStudent(id) {
        try {
            if (this.isConnected && this.db) {
                const result = await this.db.collection('students').updateOne(
                    { id: id },
                    { 
                        $set: { 
                            status: 'deactivated',
                            deactivatedAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        } 
                    }
                );
                
                if (result.matchedCount === 0) {
                    return {
                        success: false,
                        error: 'Student not found'
                    };
                }
                
                console.log(`✅ Student ${id} deactivated and archived`);
                return {
                    success: true,
                    message: 'Student deactivated successfully'
                };
            }
            
            // Fallback
            const index = this.fallbackData.students.findIndex(s => s.id === id);
            if (index !== -1) {
                this.fallbackData.students[index] = {
                    ...this.fallbackData.students[index],
                    status: 'deactivated',
                    deactivatedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                console.log('⚠️ Student deactivated in fallback data');
                return {
                    success: true,
                    message: 'Student deactivated successfully'
                };
            }
            
            return {
                success: false,
                error: 'Student not found'
            };
        } catch (error) {
            console.error('❌ Error deactivating student:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    buildPastStudentQuery(searchTerm = '', batch = '') {
        const conditions = [{ status: { $in: ['deactivated', 'inactive'] } }];

        if (batch && batch !== 'all') {
            if (batch === '—') {
                conditions.push({
                    $or: [{ batch: '—' }, { batch: { $exists: false } }, { batch: '' }, { batch: null }],
                });
            } else {
                conditions.push({ batch });
            }
        }

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.trim();
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const orConditions = [
                { name: { $regex: escaped, $options: 'i' } },
                { email: { $regex: escaped, $options: 'i' } },
                { phone: { $regex: escaped, $options: 'i' } },
                { id: { $regex: escaped, $options: 'i' } },
            ];

            const digitsOnly = term.replace(/\D/g, '');
            if (digitsOnly.length >= 4) {
                orConditions.push({ phone: { $regex: digitsOnly.slice(-4) + '$' } });
            }
            conditions.push({ $or: orConditions });
        }

        return conditions.length === 1 ? conditions[0] : { $and: conditions };
    }

    filterPastStudentsFallback(searchTerm = '', batch = '') {
        const term = searchTerm.trim().toLowerCase();
        const digitsOnly = term.replace(/\D/g, '');
        return this.fallbackData.students.filter((s) => {
            if (!['deactivated', 'inactive'].includes(s.status)) return false;
            if (batch && batch !== 'all') {
                const studentBatch = s.batch || '—';
                if (studentBatch !== batch) return false;
            }
            if (!term) return true;
            const phone = (s.phone || '').toLowerCase();
            return (
                s.name.toLowerCase().includes(term) ||
                (s.email || '').toLowerCase().includes(term) ||
                phone.includes(term) ||
                (digitsOnly.length >= 4 && phone.replace(/\D/g, '').endsWith(digitsOnly.slice(-4))) ||
                s.id.includes(term)
            );
        });
    }

    // Get all deactivated students (Past Records)
    async getPastStudents() {
        try {
            if (this.isConnected && this.db) {
                const students = await this.db.collection('students')
                    .find({ status: { $in: ['deactivated', 'inactive'] } })
                    .sort({ deactivatedAt: -1 })
                    .toArray();
                return students.map(student => ({
                    ...student,
                    _id: student._id.toString()
                }));
            }
            return this.fallbackData.students.filter(s =>
                ['deactivated', 'inactive'].includes(s.status)
            );
        } catch (error) {
            console.error('❌ Error fetching past students:', error);
            return [];
        }
    }

    async getPastStudentsPaginated({ page = 1, limit = 25, search = '', batch = '' } = {}) {
        try {
            const safePage = Math.max(1, parseInt(page, 10) || 1);
            const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
            const skip = (safePage - 1) * safeLimit;
            const query = this.buildPastStudentQuery(search, batch);

            if (this.isConnected && this.db) {
                const collection = this.db.collection('students');
                const [students, total] = await Promise.all([
                    collection
                        .find(query)
                        .sort({ deactivatedAt: -1, name: 1 })
                        .skip(skip)
                        .limit(safeLimit)
                        .toArray(),
                    collection.countDocuments(query),
                ]);

                return {
                    students: students.map((student) => ({
                        ...student,
                        _id: student._id.toString(),
                    })),
                    pagination: {
                        page: safePage,
                        limit: safeLimit,
                        total,
                        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
                    },
                };
            }

            const filtered = this.filterPastStudentsFallback(search, batch)
                .sort((a, b) => new Date(b.deactivatedAt || 0) - new Date(a.deactivatedAt || 0));
            const total = filtered.length;
            const students = filtered.slice(skip, skip + safeLimit);

            return {
                students,
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    total,
                    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
                },
            };
        } catch (error) {
            console.error('❌ Error fetching paginated past students:', error);
            return {
                students: [],
                pagination: { page: 1, limit: 25, total: 0, totalPages: 1 },
            };
        }
    }

    // Search past students by name, email, or phone
    async searchPastStudents(searchTerm) {
        const { students } = await this.getPastStudentsPaginated({
            page: 1,
            limit: 100,
            search: searchTerm,
        });
        return students;
    }

    async getPastStudentBatches() {
        try {
            const students = await this.getPastStudents();
            const batches = [...new Set(students.map((s) => s.batch || '—'))].sort();
            return batches;
        } catch (error) {
            console.error('❌ Error fetching past student batches:', error);
            return [];
        }
    }

    async deleteStudent(id) {
        try {
            if (this.isConnected && this.db) {
                const result = await this.db.collection('students').deleteOne({ id });
                
                if (result.deletedCount === 0) {
                    return {
                        success: false,
                        error: 'Student not found'
                    };
                }
                
                return {
                    success: true,
                    message: 'Student deleted successfully'
                };
            }
            
            // Fallback
            const index = this.fallbackData.students.findIndex(s => s.id === id);
            if (index !== -1) {
                this.fallbackData.students.splice(index, 1);
                console.log('⚠️ Student deleted from fallback data');
                return {
                    success: true,
                    message: 'Student deleted successfully'
                };
            }
            
            return {
                success: false,
                error: 'Student not found'
            };
        } catch (error) {
            console.error('❌ Error deleting student:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Projects CRUD operations
    async getProjects() {
        try {
            if (this.isConnected && this.db) {
                const projects = await this.db.collection('projects').find({}).toArray();
                return projects.map(project => ({
                    ...project,
                    _id: project._id.toString()
                }));
            }
            // Fallback
            return this.fallbackData.projects;
        } catch (error) {
            console.error('❌ Error fetching projects:', error);
            return this.fallbackData.projects;
        }
    }

    async addProject(projectData) {
        try {
            const project = {
                ...projectData,
                id: Date.now().toString(),
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (this.isConnected && this.db) {
                const result = await this.db.collection('projects').insertOne(project);
                return {
                    success: true,
                    data: { ...project, _id: result.insertedId.toString() }
                };
            }
            
            // Fallback
            project._id = this.getNextId('projects');
            this.fallbackData.projects.push(project);
            console.log('⚠️ Project added to fallback data (will be lost on restart)');
            return {
                success: true,
                data: project
            };
        } catch (error) {
            console.error('❌ Error adding project:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateProject(id, updateData) {
        try {
            if (this.isConnected && this.db) {
                const result = await this.db.collection('projects').updateOne(
                    { id: id },
                    { $set: { ...updateData, updatedAt: new Date().toISOString() } }
                );
                
                if (result.matchedCount === 0) {
                    return {
                        success: false,
                        error: 'Project not found'
                    };
                }
                
                return {
                    success: true,
                    message: 'Project updated successfully'
                };
            }
            
            // Fallback
            const index = this.fallbackData.projects.findIndex(p => p.id === id);
            if (index !== -1) {
                this.fallbackData.projects[index] = {
                    ...this.fallbackData.projects[index],
                    ...updateData,
                    updatedAt: new Date().toISOString()
                };
                return {
                    success: true,
                    message: 'Project updated successfully'
                };
            }
            
            return {
                success: false,
                error: 'Project not found'
            };
        } catch (error) {
            console.error('❌ Error updating project:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteProject(id) {
        try {
            if (this.isConnected && this.db) {
                const result = await this.db.collection('projects').deleteOne({ id });
                
                if (result.deletedCount === 0) {
                    return {
                        success: false,
                        error: 'Project not found'
                    };
                }
                
                return {
                    success: true,
                    message: 'Project deleted successfully'
                };
            }
            
            // Fallback
            const index = this.fallbackData.projects.findIndex(p => p.id === id);
            if (index !== -1) {
                this.fallbackData.projects.splice(index, 1);
                return {
                    success: true,
                    message: 'Project deleted successfully'
                };
            }
            
            return {
                success: false,
                error: 'Project not found'
            };
        } catch (error) {
            console.error('❌ Error deleting project:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Attendance operations
    async getAttendance() {
        try {
            if (this.isConnected && this.db) {
                const attendance = await this.db.collection('attendance').find({}).sort({ timestamp: -1 }).toArray();
                return attendance.map(record => ({
                    ...record,
                    _id: record._id.toString()
                }));
            }
            // Fallback
            return this.fallbackData.attendance;
        } catch (error) {
            console.error('❌ Error fetching attendance:', error);
            return this.fallbackData.attendance;
        }
    }

    async addAttendance(attendanceData) {
        try {
            const attendance = {
                ...attendanceData,
                id: Date.now().toString(),
                // CRITICAL FIX: Don't overwrite timestamp if already provided!
                // This was causing previous date attendance to save with current timestamp
                timestamp: attendanceData.timestamp || new Date().toISOString()
            };
            
            console.log('💾 mongoService.addAttendance:', {
                providedTimestamp: attendanceData.timestamp,
                finalTimestamp: attendance.timestamp,
                date: attendanceData.date,
                studentName: attendanceData.studentName
            });
            
            if (this.isConnected && this.db) {
                const result = await this.db.collection('attendance').insertOne(attendance);
                console.log('✅ Saved to MongoDB with timestamp:', attendance.timestamp);
                return {
                    success: true,
                    data: { ...attendance, _id: result.insertedId.toString() }
                };
            }
            
            // Fallback
            attendance._id = this.getNextId('attendance');
            this.fallbackData.attendance.push(attendance);
            return {
                success: true,
                data: attendance
            };
        } catch (error) {
            console.error('❌ Error adding attendance:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteAttendanceRecord(id) {
        try {
            if (this.isConnected && this.db) {
                const result = await this.db.collection('attendance').deleteOne({ id });
                
                if (result.deletedCount === 0) {
                    return {
                        success: false,
                        error: 'Attendance record not found'
                    };
                }
                
                return {
                    success: true,
                    message: 'Attendance record deleted successfully'
                };
            }
            
            // Fallback
            const index = this.fallbackData.attendance.findIndex(a => a.id === id);
            if (index !== -1) {
                this.fallbackData.attendance.splice(index, 1);
                return {
                    success: true,
                    message: 'Attendance record deleted successfully'
                };
            }
            
            return {
                success: false,
                error: 'Attendance record not found'
            };
        } catch (error) {
            console.error('❌ Error deleting attendance record:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Logs operations
    async getLogs(limit = 100) {
        try {
            if (this.isConnected && this.db) {
                const logs = await this.db.collection('logs').find({}).sort({ timestamp: -1 }).limit(limit).toArray();
                return logs.map(log => ({
                    ...log,
                    _id: log._id.toString()
                }));
            }
            // Fallback
            return this.fallbackData.logs.slice(0, limit);
        } catch (error) {
            console.error('❌ Error fetching logs:', error);
            return this.fallbackData.logs.slice(0, limit);
        }
    }

    async addLog(logData) {
        try {
            const log = {
                ...logData,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            };
            
            if (this.isConnected && this.db) {
                const result = await this.db.collection('logs').insertOne(log);
                return {
                    success: true,
                    data: { ...log, _id: result.insertedId.toString() }
                };
            }
            
            // Fallback
            log._id = this.getNextId('logs');
            this.fallbackData.logs.unshift(log);
            // Keep only last 100 logs
            if (this.fallbackData.logs.length > 100) {
                this.fallbackData.logs = this.fallbackData.logs.slice(0, 100);
            }
            return {
                success: true,
                data: log
            };
        } catch (error) {
            console.error('❌ Error adding log:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Templates operations
    async getTemplates() {
        try {
            if (this.isConnected && this.db) {
                const templates = await this.db.collection('templates').find({}).toArray();
                return templates.map(template => ({
                    ...template,
                    _id: template._id.toString()
                }));
            }
            // Fallback
            return this.fallbackData.templates;
        } catch (error) {
            console.error('❌ Error fetching templates:', error);
            return this.fallbackData.templates;
        }
    }

    async addTemplate(templateData) {
        try {
            const template = {
                ...templateData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            
            if (this.isConnected && this.db) {
                const result = await this.db.collection('templates').insertOne(template);
                return {
                    success: true,
                    data: { ...template, _id: result.insertedId.toString() }
                };
            }
            
            // Fallback
            template._id = this.getNextId('templates');
            this.fallbackData.templates.push(template);
            console.log('⚠️ Template added to fallback data (will be lost on restart)');
            return {
                success: true,
                data: template
            };
        } catch (error) {
            console.error('❌ Error adding template:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get single item by ID
    async getStudentById(id) {
        try {
            if (this.isConnected && this.db) {
                const student = await this.db.collection('students').findOne({ id });
                return student ? { ...student, _id: student._id.toString() } : null;
            }
            // Fallback
            return this.fallbackData.students.find(s => s.id === id) || null;
        } catch (error) {
            console.error('❌ Error fetching student by ID:', error);
            return this.fallbackData.students.find(s => s.id === id) || null;
        }
    }

    async getProjectById(id) {
        try {
            if (this.isConnected && this.db) {
                const project = await this.db.collection('projects').findOne({ id });
                return project ? { ...project, _id: project._id.toString() } : null;
            }
            // Fallback
            return this.fallbackData.projects.find(p => p.id === id) || null;
        } catch (error) {
            console.error('❌ Error fetching project by ID:', error);
            return this.fallbackData.projects.find(p => p.id === id) || null;
        }
    }

    // Project Assignment operations
    async addProjectAssignment(assignmentData) {
        try {
            const assignment = {
                ...assignmentData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            
            if (this.isConnected && this.db) {
                const result = await this.db.collection('projectAssignments').insertOne(assignment);
                return {
                    success: true,
                    data: { ...assignment, _id: result.insertedId.toString() }
                };
            }
            
            // Fallback
            assignment._id = this.getNextId('projectAssignments');
            this.fallbackData.projectAssignments.push(assignment);
            return {
                success: true,
                data: assignment
            };
        } catch (error) {
            console.error('❌ Error adding project assignment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getProjectAssignments(projectId = null) {
        try {
            if (this.isConnected && this.db) {
                const query = projectId ? { projectId } : {};
                const assignments = await this.db.collection('projectAssignments').find(query).toArray();
                return assignments.map(a => ({ ...a, _id: a._id.toString() }));
            }
            // Fallback
            if (projectId) {
                return this.fallbackData.projectAssignments.filter(a => a.projectId === projectId);
            }
            return this.fallbackData.projectAssignments;
        } catch (error) {
            console.error('❌ Error fetching project assignments:', error);
            return projectId ? this.fallbackData.projectAssignments.filter(a => a.projectId === projectId) : this.fallbackData.projectAssignments;
        }
    }

    async updateProjectAssignment(projectId, studentId, updateData) {
        try {
            if (this.isConnected && this.db) {
                const result = await this.db.collection('projectAssignments').updateOne(
                    { projectId, studentId },
                    { $set: { ...updateData, updatedAt: new Date().toISOString() } }
                );
                
                if (result.matchedCount === 0) {
                    return { success: false, error: 'Assignment not found' };
                }
                
                return { success: true, message: 'Assignment updated successfully' };
            }
            
            // Fallback
            const index = this.fallbackData.projectAssignments.findIndex(
                a => a.projectId === projectId && a.studentId === studentId
            );
            if (index !== -1) {
                this.fallbackData.projectAssignments[index] = {
                    ...this.fallbackData.projectAssignments[index],
                    ...updateData,
                    updatedAt: new Date().toISOString()
                };
                return { success: true, message: 'Assignment updated successfully' };
            }
            
            return { success: false, error: 'Assignment not found' };
        } catch (error) {
            console.error('❌ Error updating project assignment:', error);
            return { success: false, error: error.message };
        }
    }

    // Attendance Managers operations
    async getAttendanceManagers() {
        try {
            if (this.isConnected && this.db) {
                const managers = await this.db.collection('attendanceManagers').find({}).toArray();
                return managers.map(m => ({ ...m, _id: m._id.toString() }));
            }
            // Fallback
            return this.fallbackData.attendanceManagers || [];
        } catch (error) {
            console.error('❌ Error fetching attendance managers:', error);
            return this.fallbackData.attendanceManagers || [];
        }
    }

    async addAttendanceManager(manager) {
        try {
            if (this.isConnected && this.db) {
                const result = await this.db.collection('attendanceManagers').insertOne(manager);
                return {
                    success: true,
                    data: { ...manager, _id: result.insertedId.toString() }
                };
            }
            // Fallback
            this.fallbackData.attendanceManagers.push(manager);
            return {
                success: true,
                data: manager
            };
        } catch (error) {
            console.error('❌ Error adding attendance manager:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

const mongoService = new MongoService();

export default mongoService;