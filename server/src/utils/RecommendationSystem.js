const User = require('../models/User')
const Post = require('../models/Post')
const Recommendation = require('../models/Recommendation')
const { setIntervalSync } = require('./common')

function extractReactionsCount (reactions) {
  let reactionsCount = [0, 0, 0, 0, 0, 0, 0]
  reactions.forEach(reaction => {
    reactionsCount[reaction.type] += 1
  })
  return reactionsCount
}

function calculatePercentages (reactionsCount) {
  let sum = 0
  for (let i of reactionsCount) {
    sum += i
  }
  if (sum === 0) {
    return reactionsCount.map(count => -99999)
  } else {
    return reactionsCount.map(count => count / sum)
  }
}

function filterUnreactedPosts (posts, user) {
  let filtered = []
  posts.forEach(post => {
    let isReacted = false
    for (let reaction of post.reactions) {
      if (String(reaction.user) === String(user._id)) {
        isReacted = true
        break
      }
    }
    if (!isReacted) {
      filtered.push(post)
    }
  })
  return filtered
}

function calculateEucledianDistance (vector1, vector2) {
  let distance = 0
  for (let i = 0; i < 7; i++) {
    distance += Math.abs(vector1[i] - vector2[i])
  }
  return distance
}

async function updateUserRecommendations () {
  try {
    let users = await User.aggregate([
      {
        $match: {
          confirmed: true
        }
      },
      {
        $lookup: {
          from: 'reactions',
          localField: '_id',
          foreignField: 'user',
          as: 'reactions'
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          reactions: 1
        }
      }
    ])
    let dateNow = new Date()
    dateNow.setMonth(dateNow.getMonth() - 1)
    let posts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gt: dateNow }
        }
      },
      {
        $lookup: {
          from: 'reactions',
          localField: '_id',
          foreignField: 'to',
          as: 'reactions'
        }
      }
    ])
    users.forEach(user => {
      let unreactedPosts = filterUnreactedPosts(posts, user)
      let userReactionsCount = extractReactionsCount(user.reactions)
      let userReactionPercentages = calculatePercentages(userReactionsCount)
      unreactedPosts.forEach(async post => {
        let postReactionsCount = extractReactionsCount(post.reactions)
        let postReactionPercentages = calculatePercentages(postReactionsCount)
        let score = 1 / calculateEucledianDistance(userReactionPercentages, postReactionPercentages)
        await Recommendation.updateOne({ userId: user._id, postId: post._id }, { score: score }, { upsert: true })
      })
      console.log('Added recommendations for ' + user.username)
    })
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  start () {
    setIntervalSync(async function () {
      updateUserRecommendations()
    }, 10000)
  }
}
