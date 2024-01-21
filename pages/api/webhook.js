import { mongooseConnect } from '@/lib/mongoose';
import { Order } from '@/models/Order';
const stripe = require('stripe')(process.env.STRIPE_SK);
import { buffer } from 'micro';
import { Product } from '@/models/Product';

const endpointSecret =
  'whsec_d3927c5acb85a9195bf7042b7656c65376a92ac1ada09be1529c0b8149809718';

export default async function handler(req, res) {
  await mongooseConnect();
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      await buffer(req),
      sig,
      endpointSecret
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const data = event.data.object;
      // console.log(data);
      const orderId = data.metadata.orderId;
      const paid = data.payment_status === 'paid';
      if (orderId && paid) {
        await Order.findByIdAndUpdate(orderId, {
          paid: true,
        });
      }

      // 通过 orderId 查询订单
      const order = await Order.findById(orderId);

      // 遍历订单的 line_items
      for (const lineItem of order.line_items) {
        const { quantity, price_data } = lineItem;
        const productId = price_data.product_data.id;

        // 通过产品名称查询数据库中的产品
        const product = await Product.findOne({ _id: productId });

        if (product) {
          // 更新产品的 amount
          const updatedAmount = product.amount - quantity;

          // 更新数据库中的产品
          await Product.findOneAndUpdate(
            { _id: productId },
            { amount: updatedAmount }
          );
        }
        // console.log(`产品 ${productName} 更新后的数量: ${updatedAmount}`);
      }

      // console.log(data);
      break;

    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.status(200).send('ok');
}

export const config = {
  api: { bodyParser: false },
};

//merry-boom-zeal-polite
//id acct_1OCIy6Lc8R4aR2nc
//secret is whsec_5f19bc2b63f26933c24d9ef84eb1ba813e0e2deeb35677b0e0bdaacf95bcc92d
