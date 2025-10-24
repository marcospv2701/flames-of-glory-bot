const User = require('../Models/user');

async function getPoints(userId) {
  const user = await User.findOne({ userId });
  return user ? user.points : 0;
}

async function addPoints(userId, amount) {
  const user = await User.findOneAndUpdate(
    { userId },
    { $inc: { points: amount } },
    { new: true, upsert: true }
  );
  return user.points;
}

async function removePoints(userId, amount) {
  const user = await User.findOne({ userId });
  if (!user) return 0;
  user.points = Math.max(0, user.points - amount);
  await user.save();
  return user.points;
}

module.exports = { getPoints, addPoints, removePoints };
