import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../../utils/validators.js";
dotenv.config({ path: "../../.env" });

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );
};

const userResolver = {
  Mutation: {
    async login(_, { username, password }) {
      // Validation
      const { valid, errors } = validateLoginInput(username, password);
      
      if (!valid) {
        throw new GraphQLError("Errors", {
          extensions: { code: errors },
        });
      }
    
      // Check if the user exists
      const user = await User.findOne({ username });
    
      if (!user) {
        errors.general = "User not found";
        throw new GraphQLError("User not found", {
          extensions: { code: errors },
        });
      }
    
      // Compare passwords only if the user is found
      const match = await bcrypt.compare(password, user.password);
    
      if (!match) {
        errors.general = "Password didn't match";
        throw new GraphQLError("Password didn't match", {
          extensions: { code: errors },
        });
      }
    
      // If everything is correct, generate a token
      const token = generateToken(user);
    
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    }
    ,
    async register(
      parent,
      { registerInput: { username, email, password, confirmPassword } },
      context,
      info
    ) {
      // Validation
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid) {
        throw new GraphQLError("Errors", {
          extensions: { code: errors },
        });
      }
      // if user has already exits
      const user = await User.findOne({ username });
      if (user) {
        throw new GraphQLError("This username is taken", {
          extensions: { code: "USERNAME_TAKEN" },
        });
      }
      // Encrypt Password
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);
      console.log(res)
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};

export default userResolver;
