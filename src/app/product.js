import { database } from '../database.js';
import { getProductPictureUrl } from '../storage.js';

export async function getProductsHandler(_, res, next) {
  try {
    const products = await database.product.findMany();

    const dataProduct = await products.map((product) => ({
      ...product,
      picture: getProductPictureUrl(product.picture),
    }));

    return res.status(200).json({
      status_code: 200,
      message: 'OK',
      data: dataProduct,
    });
  } catch (error) {
    return next(error);
  }
}
