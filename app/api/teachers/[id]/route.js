/**
 * Teacher API Routes by ID (Admin only)
 * GET /api/teachers/:id - Get single teacher
 * PUT /api/teachers/:id - Update teacher
 * DELETE /api/teachers/:id - Delete teacher
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Progress from '@/models/Progress';
import Settings from '@/models/Settings';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError, notFoundResponse } from '@/lib/apiResponse';
import { clearCache } from '@/lib/cache';

// GET - Get single teacher with details
export async function GET(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const teacher = await User.findOne({ _id: params.id, role: 'teacher' })
            .select('-password')
            .lean();

        if (!teacher) {
            return notFoundResponse('Teacher');
        }

        // Get student count and total stars given
        const students = await Student.find({ teacherId: params.id }).lean();
        const studentCount = students.length;
        const totalStarsGiven = students.reduce((sum, s) => sum + (s.stars || 0), 0);

        return successResponse({
            teacher: {
                ...teacher,
                studentCount,
                totalStarsGiven
            }
        });
    } catch (error) {
        console.error('Get teacher error:', error);
        return serverError('Failed to fetch teacher');
    }
}

// PUT - Update teacher
export async function PUT(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const teacher = await User.findById(params.id);
        if (!teacher) {
            return notFoundResponse('User');
        }

        const body = await request.json();
        const { name, phone, password, role, balance, subscriptionEndDate, subscriptionStatus } = body;

        // Basic updates
        if (name) teacher.name = name;
        if (phone !== undefined) teacher.phone = phone;
        if (role) teacher.role = role;
        if (password) {
            teacher.plainPassword = password;
            teacher.password = password;
        }

        // 🔥 OPTIMIZED: Auto-purchase logic only if balance is being set
        if (balance !== undefined) {
            const now = new Date();
            let currentDaysRemaining = 0;
            
            // Quick calculation without extra queries
            if (teacher.subscriptionStatus === 'active' && teacher.subscriptionEndDate) {
                const endDate = new Date(teacher.subscriptionEndDate);
                if (endDate > now) {
                    currentDaysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                }
            }

            // Auto-convert to days only if days = 0
            if (currentDaysRemaining === 0 && balance >= 500) {
                // 🚀 FAST: Use default 500 instead of DB query
                const dailyPrice = 500;
                const daysToAdd = Math.floor(balance / dailyPrice);
                const finalBalance = balance - (daysToAdd * dailyPrice);

                const newEndDate = new Date(now);
                newEndDate.setDate(newEndDate.getDate() + daysToAdd);

                teacher.balance = finalBalance;
                teacher.subscriptionStatus = 'active';
                teacher.subscriptionEndDate = newEndDate;
                teacher.lastPaymentDate = now;
            } else {
                teacher.balance = balance;
            }
        }

        // Manual subscription override
        if (subscriptionEndDate !== undefined) {
            teacher.subscriptionEndDate = subscriptionEndDate;
        }
        if (subscriptionStatus !== undefined) {
            teacher.subscriptionStatus = subscriptionStatus;
        }

        // Single save operation
        await teacher.save();

        // 🚀 Clear cache so next request gets fresh data
        clearCache('admin:users');

        // Return minimal data
        return successResponse({
            message: 'User updated successfully',
            user: {
                _id: teacher._id,
                name: teacher.name,
                phone: teacher.phone,
                role: teacher.role,
                balance: teacher.balance,
                subscriptionEndDate: teacher.subscriptionEndDate,
                subscriptionStatus: teacher.subscriptionStatus,
                daysRemaining: teacher.getDaysRemaining(),
                plainPassword: teacher.plainPassword
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        return serverError('Failed to update user');
    }
}

// DELETE - Delete teacher and their data
export async function DELETE(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const user = await User.findById(params.id);
        if (!user) {
            return notFoundResponse('User');
        }

        // Get all students of this user if they are a teacher
        if (user.role === 'teacher') {
            const students = await Student.find({ teacherId: params.id });
            const studentIds = students.map(s => s._id);

            // Delete all progress records for these students
            await Progress.deleteMany({ studentId: { $in: studentIds } });

            // Delete all students
            await Student.deleteMany({ teacherId: params.id });
        }

        // Delete user
        await User.findByIdAndDelete(params.id);

        // 🚀 Clear cache so next request gets fresh data
        clearCache('admin:users');

        return successResponse({
            message: 'User and all related data deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return serverError('Failed to delete user');
    }
}
