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