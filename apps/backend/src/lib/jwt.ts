import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (userId: number): string => {

    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};

export const verifyToken = (token: string): number | null => {

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        return decoded.userId;
    } catch (err) {
        return null;
    };
}
