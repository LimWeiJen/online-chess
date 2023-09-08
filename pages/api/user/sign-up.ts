import { MongoClient, ServerApiVersion } from 'mongodb'
import jwt from 'jsonwebtoken';

const client = new MongoClient(process.env.MONGODB_URI!, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})


export default async function handler(req: any, res: any) {
	try {		
    const { username, name, password } = req.body;
  
    await client.connect();
    const db = client.db("database")
    const users = db.collection("users")
    const usernames = await db.collection("usernames").find({}).toArray();
    console.log({username, name, password});
    
    let duplicatedUsernames = false;
    usernames.forEach(uname => {
      if (uname.name === username) duplicatedUsernames = true;
    })
    if (duplicatedUsernames) return res.status(409).json({ message: 'duplicated username' });
  
    await db.collection("usernames").insertOne({ name: username });
  
    const newUser = {
      name,
      username,
      password,
    }
    await users.insertOne(newUser);
    await client.close();
  
    const token = jwt.sign({username}, process.env.JWT_SECRET!);
  
    return res.status(200).json({ success: true, token });
	} catch (error) {
		return res.status(500).json({ message: 'unexpected internal server error', fullError: error })
	}
}
