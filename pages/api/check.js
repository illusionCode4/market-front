import { mongooseConnect } from '@/lib/mongoose';
import { Product } from '@/models/Product';

export default async function handle(req, res) {
  await mongooseConnect();

  if (req.method === 'POST') {
    const { cartProducts } = req.body;

    const productsIds = cartProducts;
    const uniqueIds = [...new Set(productsIds)];
    const productsInfos = await Product.find({ _id: uniqueIds });

    const data = {}; // 用于存储响应信息

    for (const productId of uniqueIds) {
      const productInfo = productsInfos.find(
        (p) => p._id.toString() === productId
      );
      const quantity =
        productsIds.filter((id) => id === productId)?.length || 0;
      if (quantity > 0 && productInfo) {
        data[productId] = quantity;
      }
    }

    for (const productId in data) {
      const product = await Product.findById(productId);
      if (product && product.amount >= data[productId]) {
        // console.log(product);
      } else {
        // 返回数量不足的响应
        return res
          .status(403)
          .json({ error: `${product.title}数量不足,剩余${product.amount}个` });
      }
    }

    // 在循环结束后发送一次响应
    res.json(data);
  }
}
