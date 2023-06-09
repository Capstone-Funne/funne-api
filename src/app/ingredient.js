import axios from 'axios';
import { v4 as uuid } from 'uuid';

import { database } from '../database.js';
import { InvariantError } from '../exception/invariant-error.js';
import { checkIsIngredientsPictureExists } from '../storage.js';

const ML_MODEL_ENDPOINT = `${process.env.ML_SERVER_BASE_URL}/v1/models/funne:predict`;
const ML_VOCABULARY_ENDPOINT =
  'https://storage.googleapis.com/funne-machine-learning/vocabulary.json';

const vocabulary = (await axios.get(ML_VOCABULARY_ENDPOINT)).data;

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/);
}

async function predict(text) {
  const tokens = tokenize(text);

  const inputs = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const idx = vocabulary.indexOf(token);
    if (idx === -1) {
      inputs.push(1);
    } else {
      inputs.push(idx);
    }
  }

  const response = await axios.post(ML_MODEL_ENDPOINT, {
    instances: [inputs],
  });

  const prediction = response.data.predictions[0][0];
  return Math.round(prediction);
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
