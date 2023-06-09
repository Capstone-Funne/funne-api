import { database } from '../database.js';

export async function getSolutionsHandler(_, res, next) {
  try {
    const solutions = await database.solutions.findMany();

    const dataSolution = await solutions.map((solution) => ({ ...solution }));

    return res.status(200).json({
      status_code: 200,
      message: 'OK',
      data: dataSolution,
    });
  } catch (error) {
    return next(error);
  }
}
