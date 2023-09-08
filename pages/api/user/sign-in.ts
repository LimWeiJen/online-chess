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
    const { username, password } = req.body;
    await client.connect();
    const users = client.db("database").collection("users");
    const user: any = await users.findOne({ username });
    
    if (user && user.password === password) {
      const token = jwt.sign({username}, process.env.JWT_SECRET!);
      return res.status(200).json({ success: true, token });
    }
  
    if (!user) return res.status(404).json({ message: 'user not found' });
  
    return res.status(401).json({ message: 'invalid credentials' });
	} catch (error) {
    console.log(error);
		return res.status(500).json({ message: 'unexpected internal server error', fullError: error })
	}
}
