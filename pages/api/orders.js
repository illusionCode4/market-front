import { mongooseConnect } from '@/lib/mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { Order } from '@/models/Order';

export default async function handle(req, res) {
  await mongooseConnect();

  const { user } = await getServerSession(req, res, authOptions);

  if (req.method === 'GET') {
    res.json(await Order.find({ userEmail: user.email }));
    // console.log(res.json(await Order.find({ userEmail: user.email })));
  }

  if (req.method === 'POST') {
    const { action } = req.body;

    if (action === 'confirm') {
      const { id, confirmed } = req.body;
      res.json(
        await Order.findOneAndUpdate(
          { _id: id },
          { $set: { confirmed: confirmed } },
          { new: true }
        )
      );
    }

    if (action === 'cancel') {
      const { id, canceled } = req.body;
      res.json(
        await Order.findOneAndUpdate(
          { _id: id },
          { $set: { canceled: canceled } },
          { new: true }
        )
      );
    }
  }
}
