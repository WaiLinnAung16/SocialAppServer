import { GraphQLError } from "graphql";
import Post from "../../models/Post.js";
import checkAuth from "../../utils/check-auth.js";

const postResolver = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (error) {}
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not Found");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      // console.log(context.token);
      if (context) {
        const user = checkAuth(context);
        if (body.trim() === "") {
          throw new GraphQLError("Body must not empty");
        }
        const newPost = new Post({
          body,
          user: user.id,
          username: user.username,
          createdAt: new Date().toISOString(),
        });

        const post = await newPost.save();

        return post;
      }
      throw new GraphQLError("Authorization header must be provided");
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);
      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.deleteOne();
          return "Post delete successfully";
        } else {
          throw new GraphQLError("Action not allowed", {
            extensions: { code: "Authentication error" },
          });
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }

        await post.save();
        return post;
      }
      throw new GraphQLError("Post Not Found");
    },
  },
};

export default postResolver;
