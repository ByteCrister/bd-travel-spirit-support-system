/**
 * Generate a strong random password.
 *
 * Produces a password of the requested `length` that contains at least one
 * uppercase letter, one lowercase letter, one digit, and one symbol. The
 * remaining characters are filled from the full character set and the final
 * result is shuffled and truncated to the requested length.
 *
 * Note: this implementation uses `Math.random()` which is **not** cryptographically
 * secure. For security-sensitive use (password managers, authentication tokens),
 * prefer a CSPRNG such as `crypto.getRandomValues` or a dedicated library.
 *
 * @param {number} [length=10] - Desired password length. If `length` is less
 *   than 4, the function will still attempt to include one character from each
 *   required category but the final password will be truncated to `length`.
 * @returns {string} A randomly generated password string of exactly `length`
 *   characters (unless `length` is negative or non-finite, in which case
 *   behavior follows JavaScript string/array semantics).
 */
export default function generateStrongPassword(length = 10) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}<>?";
    const all = upper + lower + digits + symbols;
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
    let pwd = pick(upper) + pick(lower) + pick(digits) + pick(symbols);
    while (pwd.length < length) pwd += pick(all);
    return pwd.split("").sort(() => Math.random() - 0.5).join("").slice(0, length);
}