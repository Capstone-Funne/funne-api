import axios from 'axios';

const ML_MODEL_ENDPOINT = `${process.env.ML_BASE_URL}/versions/${process.env.ML_VERSION}:predict`;
const ML_VOCABULARY_ENDPOINT = `${process.env.ML_VOCABULARY_BASE_URL}/saved_models/${process.env.ML_VERSION}/assets/vocabulary.json`;

const vocabulary = (await axios.get(ML_VOCABULARY_ENDPOINT)).data;

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/);
}

export async function predict(text) {
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
