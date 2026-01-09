const postModel = require("../models/post.model");
const postService = require("../services/post.service");
const queueService = require("../services/queue.service");

const {
    DEFAULT_PAGE_SIZE,
    ERROR_MESSAGES,
    HTTP_STATUS,
} = require("../config/constants");

const getAll = async (req, res) => {
    const page = +req.query.page || 1;
    const result = await postService.pagination(page, DEFAULT_PAGE_SIZE, {
        user_id: req.query.user_id,
    });

    queueService.push({
        type: "demo",
    });

    res.paginate(result);
};

const getOne = async (req, res) => {
    const post = await postModel.findOne(req.params.id);
    if (!post)
        return res.error(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    res.success(post);
};

const create = (req, res) => {};

module.exports = { getAll, getOne, create };
