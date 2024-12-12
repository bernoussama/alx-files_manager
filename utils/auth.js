import sha1 from 'sha1';

export function verifyPassword(password, hash) {
  console.log(`pass: ${sha1(password)} hash: ${hash}`);
  return sha1(password) === hash;
}
export function hashPassword(password) {
  return sha1(password);
}
export function parseAuthHeader(authHeader) {
  const [type, credentials] = authHeader.split(' ');
  if (type.toLowerCase() !== 'basic') {
    throw new Error('Invalid authentication type');
  }
  const [email, password] = Buffer.from(credentials, 'base64')
    .toString()
    .split(':');
  return { email, password };
}
