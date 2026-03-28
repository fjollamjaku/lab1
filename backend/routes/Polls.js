const express = require("express");
const router = express.Router();
const { Polls, PollOptions, PollVotes } = require("../models");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", async (req, res) => {
  try {
    const polls = await Polls.findAll({
      include: [
        {
          model: PollOptions,
          as: "options",
          include: [
            {
              model: PollVotes,
              as: "votes",
              attributes: ["id", "username"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    const formatted = polls.map((poll) => ({
      id: poll.id,
      question: poll.question,
      username: poll.username,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      options: poll.options.map((option) => ({
        id: option.id,
        text: option.text,
        votesCount: option.votes.length,
        voters: option.votes.map((vote) => vote.username),
      })),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Gabim në leximin e sondazheve." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const poll = await Polls.findByPk(req.params.id, {
      include: [
        {
          model: PollOptions,
          as: "options",
          include: [
            {
              model: PollVotes,
              as: "votes",
              attributes: ["id", "username"],
            },
          ],
        },
      ],
    });

    if (!poll) {
      return res.status(404).json({ error: "Sondazhi nuk u gjet." });
    }

    const formatted = {
      id: poll.id,
      question: poll.question,
      username: poll.username,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      options: poll.options.map((option) => ({
        id: option.id,
        text: option.text,
        votesCount: option.votes.length,
        voters: option.votes.map((vote) => vote.username),
      })),
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Gabim në leximin e sondazhit." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Pyetja është e detyrueshme." });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: "Duhet minimum 2 opsione." });
    }

    const cleanedOptions = options
      .map((opt) => String(opt).trim())
      .filter((opt) => opt.length > 0);

    if (cleanedOptions.length < 2) {
      return res.status(400).json({ error: "Duhet minimum 2 opsione valide." });
    }

    const poll = await Polls.create({
      question: question.trim(),
      username: req.user.username,
    });

    await PollOptions.bulkCreate(
      cleanedOptions.map((text) => ({
        text,
        pollId: poll.id,
      }))
    );

    const createdPoll = await Polls.findByPk(poll.id, {
      include: [
        {
          model: PollOptions,
          as: "options",
          include: [
            {
              model: PollVotes,
              as: "votes",
              attributes: ["id", "username"],
            },
          ],
        },
      ],
    });

    const formatted = {
      id: createdPoll.id,
      question: createdPoll.question,
      username: createdPoll.username,
      createdAt: createdPoll.createdAt,
      updatedAt: createdPoll.updatedAt,
      options: createdPoll.options.map((option) => ({
        id: option.id,
        text: option.text,
        votesCount: option.votes.length,
        voters: option.votes.map((vote) => vote.username),
      })),
    };

    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Krijimi i sondazhit dështoi." });
  }
});

router.post("/:id/vote", requireAuth, async (req, res) => {
  try {
    const pollId = Number(req.params.id);
    const { optionId } = req.body;

    const poll = await Polls.findByPk(pollId, {
      include: [{ model: PollOptions, as: "options" }],
    });

    if (!poll) {
      return res.status(404).json({ error: "Sondazhi nuk u gjet." });
    }

    const selectedOption = poll.options.find(
      (option) => option.id === Number(optionId)
    );

    if (!selectedOption) {
      return res.status(400).json({ error: "Opsioni nuk i takon këtij sondazhi." });
    }

    const existingVote = await PollVotes.findOne({
      where: {
        pollId,
        username: req.user.username,
      },
    });

    if (existingVote) {
      return res.status(400).json({ error: "Ti ke votuar tashmë në këtë sondazh." });
    }

    await PollVotes.create({
      pollId,
      optionId: selectedOption.id,
      username: req.user.username,
    });

    const updatedPoll = await Polls.findByPk(pollId, {
      include: [
        {
          model: PollOptions,
          as: "options",
          include: [
            {
              model: PollVotes,
              as: "votes",
              attributes: ["id", "username"],
            },
          ],
        },
      ],
    });

    const formatted = {
      id: updatedPoll.id,
      question: updatedPoll.question,
      username: updatedPoll.username,
      createdAt: updatedPoll.createdAt,
      updatedAt: updatedPoll.updatedAt,
      options: updatedPoll.options.map((option) => ({
        id: option.id,
        text: option.text,
        votesCount: option.votes.length,
        voters: option.votes.map((vote) => vote.username),
      })),
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Votimi dështoi." });
  }
});

module.exports = router;