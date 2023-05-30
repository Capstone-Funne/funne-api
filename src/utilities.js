export function getPictureByName(name) {
  return encodeURI(`https://api.dicebear.com/6.x/initials/svg?seed=${name}`);
}
