import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    name: String,
    phone: String,
    role: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function getAdminId() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const admin = await User.findOne({ role: 'admin' })
            .select('_id username email name phone role')
            .lean();
        
        if (admin) {
            console.log('\n=== Admin User ===');
            console.log('ID:', admin._id.toString());
            console.log('Name:', admin.name || 'N/A');
            console.log('Username:', admin.username || 'N/A');
            console.log('Email:', admin.email || 'N/A');
            console.log('Phone:', admin.phone || 'N/A');
            console.log('Role:', admin.role);
        } else {
            console.log('Admin user not found');
        }
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

getAdminId();
