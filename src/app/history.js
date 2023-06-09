import { database } from '../database.js';
import { getIngredientsPictureUrl } from '../storage.js';

export async function getUserHistoryHandler(req, res, next) {
  try {
    const histories = await database.history.findMany({
      select: {
        id: true,
        ingredients: true,
        picture: true,
        results: true,
        createdAt: true,
      },
      where: {
        userId: req.user.id,
      },
    });

    return res.status(200).json({
      status_code: 200,
      message: 'OK',
      data: histories.map((history) => ({
        id: history.id,
        ingredients: history.ingredients,
        picture: getIngredientsPictureUrl(history.picture),
        results: history.results,
        created_at: history.createdAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
}
