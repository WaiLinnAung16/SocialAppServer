import Post from "../../models/Post.js";
import checkAuth from "../../utils/check-auth.js";
import { GraphQLError } from "graphql";

const commentResolver = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context);
      if (body.trim() === "") {
        throw new GraphQLError("Empty comment", {
          extensions: { code: "Comment body must not empty" },
        });
      }
      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      }
      throw new GraphQLError("Post not found");
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex =  post.comments.findIndex(
          (c) => c.id === commentId
        );
        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new GraphQLError("Comment Not Found", {
            extensions: { code: "UserInputError" },
          });
        }
      }
    },
    
  },
};

export default commentResolver;
