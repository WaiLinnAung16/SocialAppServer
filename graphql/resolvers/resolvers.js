import postResolver from "./posts.js";
import userResolver from "./users.js";
import commentResolver from "./comments.js";
const resolvers = {
  Post:{
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length
  },
  Query: {
    ...postResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...postResolver.Mutation,
    ...commentResolver.Mutation,
  },
};

export default resolvers;
