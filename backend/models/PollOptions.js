module.exports = (sequelize, DataTypes) => {
  const PollOptions = sequelize.define("PollOptions", {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pollId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  PollOptions.associate = (models) => {
    PollOptions.belongsTo(models.Polls, {
      foreignKey: "pollId",
      as: "poll",
    });

    PollOptions.hasMany(models.PollVotes, {
      foreignKey: "optionId",
      as: "votes",
      onDelete: "CASCADE",
    });
  };

  return PollOptions;
};