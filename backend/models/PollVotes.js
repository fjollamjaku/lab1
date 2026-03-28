module.exports = (sequelize, DataTypes) => {
  const PollVotes = sequelize.define("PollVotes", {
    pollId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    optionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  PollVotes.associate = (models) => {
    PollVotes.belongsTo(models.Polls, {
      foreignKey: "pollId",
      as: "poll",
    });

    PollVotes.belongsTo(models.PollOptions, {
      foreignKey: "optionId",
      as: "option",
    });
  };

  return PollVotes;
};