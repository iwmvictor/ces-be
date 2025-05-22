import jwt from "jsonwebtoken";

export const verifyToken = async (
  data: string,
): Promise<string | jwt.JwtPayload> => {
  return jwt.verify(data, process.env.JWT_SECRET!);
};
