const express = require("express");
const router = express.Router();

const {createSnippet, getUserSnippets, getSnippetById, updateSnippet, deleteSnippet} = require("../controllers/snippet.controller");

const { verifyJWTToken } = require("../middleware/auth.middleware");

router.use(verifyJWTToken);

router.post('/create', createSnippet);
router.get('/user', getUserSnippets);
router.get('/:id', getSnippetById);
router.put('/:id', updateSnippet);
router.delete('/:id', deleteSnippet);

module.exports = router;