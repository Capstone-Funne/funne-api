import { v4 as uuid } from 'uuid';

import { database } from '../database.js';
import { InvariantError } from '../exception/invariant-error.js';
import { checkIsIngredientsPictureExists } from '../storage.js';
import { predict } from '../prediction.js';

export async function analyzeIngredientsHandler(req, res, next) {
  const payload = req.body;

  try {
    if (!payload.ingredients) {
      throw new InvariantError('Bahan wajib dimasukan');
    }

    const rawIngredients = payload.ingredients
      .split(',')
      .map((ingredient, index) => ({
        id: index,
        name: ingredient.trim(),
      }));

    const predictions = await Promise.all(
      rawIngredients.map((ingredient) => predict(ingredient.name))
    );

    const ingredientList = [];
    predictions.forEach((prediction, index) => {
      if (prediction === 1) {
        ingredientList.push(rawIngredients[index]);
      }
    });

    const isPictureExist = await checkIsIngredientsPictureExists(
      payload.image_id
    );

    await database.history.create({
      data: {
        id: uuid(),
        userId: req.user.id,
        ingredients: payload.ingredients,
        picture: isPictureExist ? payload.image_id : null,
        results: ingredientList,
      },
    });

    return res.status(200).json({
      status_code: 200,
      message: 'OK',
      data: ingredientList,
    });
  } catch (error) {
    return next(error);
  }
}
