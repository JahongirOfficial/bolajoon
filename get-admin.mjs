import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function getAdminId() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('bolajon-uz');
        const admin = await db.collection('users').findOne(
            { role: 'admin' },
            { projection: { _id: 1, username: 1, email: 1, name: 1, phone: 1 } }
        );
        
        if (admin) {
            console.log('\n=== Admin User ===');
            console.log('ID:', admin._id.toString());
            console.log('Name:', admin.name || 'N/A');
            console.log('Username:', admin.username || 'N/A');
            console.log('Email:', admin.email || 'N/A');
            console.log('Phone:', admin.phone || 'N/A');
        } else {
            console.log('Admin user not found');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
    }
}

getAdminId();
