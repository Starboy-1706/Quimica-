import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Hash de contraseñas con scrypt (nativo de Node.js).
 * Formato almacenado: scrypt$N$r$p$salt_b64$hash_b64
 * Las cuentas son individuales: cada persona tiene su propia credencial.
 */
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16);
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (error, derivedKey) => {
        if (error) return reject(error);
        resolve(
          [
            "scrypt",
            String(SCRYPT_N),
            String(SCRYPT_R),
            String(SCRYPT_P),
            salt.toString("base64"),
            Buffer.from(derivedKey).toString("base64"),
          ].join("$"),
        );
      },
    );
  });
}

export function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    const parts = storedHash.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return resolve(false);

    const [, n, r, p, saltB64, hashB64] = parts;
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");

    scrypt(
      password,
      salt,
      expected.length,
      { N: Number(n), r: Number(r), p: Number(p) },
      (error, derivedKey) => {
        if (error) return resolve(false);
        const derived = Buffer.from(derivedKey);
        resolve(
          derived.length === expected.length &&
            timingSafeEqual(derived, expected),
        );
      },
    );
  });
}
