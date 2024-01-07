import User from '@/models/User';
import { mongooseConnect } from '@/lib/mongoose';

mongooseConnect();

export default async function handler(req, res) {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    user = new User({ email, password });
    await user.save();

    res.json({
      message: 'Account created',
    });
  } catch (error) {
    console.log(error);
  }
}
