const Post = require("../models/Post");

exports.viewCreateScreen = function (req, res) {
    res.render("create-post");
};

exports.create = function (req, res) {
    let post = new Post(req.body, req.session.user._id);
    post
        .create()
        .then(newId => {
            req.flash("success", "New post created successfully.");
            req.session.save(() => {
                res.redirect(`/post/${newId}`);
            });
        })
        .catch(errors => {
            console.log(errors);
            errors.forEach(err => {
                req.flash("errors", err);
            });
            req.session.save(() => {
                res.redirect("/create-post");
            });
        });
};

exports.apiCreate = function (req, res) {
    let post = new Post(req.body, req.apiUser._id);
    post
        .create()
        .then(newId => {
            res.json("Congrats");
        })
        .catch(errors => {
            res.json(errors);
        });
};

exports.viewSingle = async function (req, res) {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId);
        // console.log(post.title);
        res.render("post-screen", {post: post, title: post.title});
    } catch {
        res.render("404");
    }
};

exports.viewEditScreen = async (req, res) => {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId);
        console.log(post);
        console.log(req.visitorId + " Visitor id");
        if (post.authorId == req.visitorId) {
            res.render("edit-post", {post: post});
        } else {
            req.flash("errors", "You don't have permission to perform this action.");
            req.session.save(() => {
                res.redirect("/");
            });
        }
    } catch {
        res.render("404");
    }
};

exports.edit = (req, res) => {
    let post = new Post(req.body, req.visitorId, req.params.id);
    // console.log(req.visitorId + "<-from edit, controller");
    post
        .update()
        .then(status => {
            //post was updated successfully
            //validation error
            if (status == "success") {
                //updated
                req.flash("success", "Post updated successfully.");
                req.session.save(() => {
                    res.redirect(`/post/${req.params.id}/edit`);
                });
            } else {
                //validation error
                post.errors.forEach(err => {
                    req.flash("errors", err);
                });
                req.session.save(() => {
                    res.redirect(`/post/${req.params.id}/edit`);
                });
            }
        })
        .catch(() => {
            //post with id doesn't exist
            //or current visitor is a guest
            req.flash("errors", "You don't have access to perform this action");
            req.session.save(() => {
                res.redirect("/");
            });
        });
};

exports.delete = function (req, res) {
    Post.delete(req.params.id, req.visitorId)
        .then(() => {
            req.flash("success", "Post deleted successfullly");
            req.session.save(() =>
                res.redirect(`/profile/${req.session.user.username}`)
            );
        })
        .catch(() => {
            req.flash("errors", "You don't have permission to perform this action.");
            req.session.save(() => res.redirect(``));
        });
};
exports.apiDelete = function (req, res) {
    Post.delete(req.params.id, req.apiUser._id)
        .then(() => {
            res.json("Success");
        })
        .catch(() => {
           res.json('You dont have access to perform this action.')
        });
};

exports.search = function (req, res) {
    Post.search(req.body.searchTerm)
        .then(posts => {
            res.json(posts);
        })
        .catch(() => {
            res.json([]);
        });
};
