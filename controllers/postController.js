const Post = require("../models/Post");

exports.viewCreateScreen = function(req, res) {
  res.render("create-post");
};

exports.create = function(req, res) {
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(() => {
      res.send("New post created.");
    })
    .catch(errors => {
      console.log(errors);
      res.send(errors);
    });
};

exports.viewSingle = async function(req, res) {
  try {
    let post = await Post.findSingleById(req.params.id);
    console.log(post.title);
    res.render("post-screen", { post: post });
  } catch {
    res.render("404");
  }
};
