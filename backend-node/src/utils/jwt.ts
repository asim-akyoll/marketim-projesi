import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "default_secret";

export const generateToken = (payload: object, expiresIn: string | number = "24h") => {
    return jwt.sign(payload, SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        return null;
    }
};
