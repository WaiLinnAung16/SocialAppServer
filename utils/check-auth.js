import jwt from "jsonwebtoken";
import "dotenv/config";
import { GraphQLError } from "graphql";

const checkAuth = (context) => {
  const token = context.token;
  if (token) {
    try {
      const user = jwt.verify(token, process.env.SECRET_KEY);
      return user;
    } catch (error) {
      throw new GraphQLError("Invalid/Expired Token", {
        extensions: { code: "FORBIDDEN" },
      });
    }
  }

  throw new GraphQLError("Authentication must be 'Bearer [token]");
};

export default checkAuth;
