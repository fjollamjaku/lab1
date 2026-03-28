const express = require('express')

const router = express.Router()
const { Posts } = require("../models")
const { requireAuth } = require("../middleware/authMiddleware")

router.get("/", async (req, res) => {
    const listofPosts = await Posts.findAll({ order: [['id', 'DESC']] })
    res.json(listofPosts)
})

router.get("/:id", async (req, res) => {
    const id = req.params.id
    const post = await Posts.findByPk(id)
    if (!post) return res.status(404).json({ error: "Posti nuk u gjet" })
    res.json(post)
})

router.post("/", requireAuth, async (req, res) => {
    const { title, postText } = req.body
    if (!title || !postText) {
        return res.status(400).json({ error: "title dhe postText janë të detyrueshme" })
    }
    const newPost = await Posts.create({
        title,
        postText,
        username: req.user.username,
    })
    res.status(201).json(newPost)
})

router.put("/:id", requireAuth, async (req, res) => {
    const id = req.params.id
    const { title, postText } = req.body
    const post = await Posts.findByPk(id)
    if (!post) return res.status(404).json({ error: "Posti nuk u gjet" })
    if (post.username !== req.user.username) {
        return res.status(403).json({ error: "Nuk ke leje të ndryshosh këtë postim" })
    }
    if (!title || !postText) {
        return res.status(400).json({ error: "title dhe postText janë të detyrueshme" })
    }
    await Posts.update(
        { title, postText, username: post.username },
        { where: { id } }
    )
    const updated = await Posts.findByPk(id)
    res.json(updated)
})

router.delete("/:id", requireAuth, async (req, res) => {
    const id = req.params.id
    const post = await Posts.findByPk(id)
    if (!post) return res.status(404).json({ error: "Posti nuk u gjet" })
    if (post.username !== req.user.username) {
        return res.status(403).json({ error: "Nuk ke leje të fshish këtë postim" })
    }
    await Posts.destroy({ where: { id } })
    res.json({ message: "Posti u fshi" })
})

module.exports = router