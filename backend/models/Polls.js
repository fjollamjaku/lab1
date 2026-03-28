module.exports = (sequelize, DataTypes) => {
  const Polls = sequelize.define("Polls", {
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Polls.associate = (models) => {
    Polls.hasMany(models.PollOptions, {
      foreignKey: "pollId",
      as: "options",
      onDelete: "CASCADE",
    });
  };

  return Polls;
};