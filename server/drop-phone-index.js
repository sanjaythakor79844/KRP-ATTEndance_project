import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'krp_academy_db';

async function dropPhoneIndex() {
  console.log('🔧 Connecting to MongoDB...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('students');
    
    // Check existing indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Drop phone_1 index if it exists
    try {
      await collection.dropIndex('phone_1');
      console.log('\n✅ Successfully dropped phone_1 index');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('\n⚠️ phone_1 index not found (already removed or never existed)');
      } else {
        throw error;
      }
    }
    
    // Show updated indexes
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    console.log('\n✅ Phone field index removed successfully!');
    console.log('✅ Students can now be added without phone numbers');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n📴 Disconnected from MongoDB');
  }
}

dropPhoneIndex();
