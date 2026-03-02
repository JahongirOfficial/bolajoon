/**
 * Ensure MongoDB Indexes Script
 * Run this to create all necessary indexes for optimal performance
 * Usage: node scripts/ensure-indexes.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import Student from '../models/Student.js';

dotenv.config();

async function ensureIndexes() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n📊 Creating indexes...');
        
        // Create indexes for User model
        console.log('Creating User indexes...');
        await User.createIndexes();
        
        // Create indexes for Lesson model
        console.log('Creating Lesson indexes...');
        await Lesson.createIndexes();
        
        // Create indexes for Progress model
        console.log('Creating Progress indexes...');
        await Progress.createIndexes();
        
        // Create indexes for Student model
        console.log('Creating Student indexes...');
        await Student.createIndexes();

        console.log('\n✅ All indexes created successfully!');
        console.log('\n📋 Index Summary:');
        console.log('- User: role');
        console.log('- Lesson: level + order, isActive');
        console.log('- Progress: lessonId');
        console.log('- Student: teacher, teacher + isActive');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
}

ensureIndexes();
