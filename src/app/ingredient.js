import { InvariantError } from '../exception/invariant-error.js';

// TODO: Implement ML Model to predict ingredient
// eslint-disable-next-line no-unused-vars
function predict(text) {
  return Promise.resolve(1);
}

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

    return res.status(200).json({
      status_code: 200,
      message: 'OK',
      data: ingredientList,
    });
  } catch (error) {
    return next(error);
  }
}
