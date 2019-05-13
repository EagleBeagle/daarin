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

function reactionSum (reactions) {
  let sum = 0
  for (let i of reactions) {
    sum += i
  }
  return sum
}

function calculatePercentages (reactionsCount) {
  let sum = reactionSum(reactionsCount)
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
        score *= reactionSum(postReactionsCount)
        await Recommendation.updateOne({ userId: user._id, postId: post._id }, { score: score }, { upsert: true })
      })
      console.log('Added recommendations for ' + user.username)
    })
  } catch (err) {
    console.log(err)
  }
}

async function updatePostSimilarity () {
  try {
    let dateNow = new Date()
    dateNow.setMonth(dateNow.getMonth() - 1)
    let updatedPosts = []
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
    posts.forEach(post => {
      let postReactionsCount = extractReactionsCount(post.reactions)
      let postReactionPercentages = calculatePercentages(postReactionsCount)
      posts.forEach(async otherPost => {
        if (!updatedPosts.includes(otherPost) && post._id !== otherPost._id) {
          let otherPostReactionsCount = extractReactionsCount(otherPost.reactions)
          let otherPostReactionPercentages = calculatePercentages(otherPostReactionsCount)
          let score = 1 / calculateEucledianDistance(postReactionPercentages, otherPostReactionPercentages)
          if (score === Infinity) {
            score = 0.00000001
          }
          await Recommendation.deleteOne({ $or: [ { postId: post._id, postId2: otherPost._id }, { postId: otherPost._id, postId2: post._id } ] })
          await Recommendation.create({ postId: post._id, postId2: otherPost._id, score: score })
        }
      })
      updatedPosts.push(post)
    })
  } catch (err) {
    console.log(err)
  }
}

async function updateTrendingPosts () {
  let dateNow = new Date()
  dateNow.setDate(dateNow.getDate() - 7)
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
  posts.forEach(async post => {
    let distinctReactionCount = 0
    let reactingUsers = new Set()
    post.reactions.forEach(reaction => {
      if (!reactingUsers.has(String(reaction.user))) {
        distinctReactionCount += 1
        reactingUsers.add(String(reaction.user))
      }
    })
    let dateNow = new Date()
    let timeDifference = (dateNow - post.createdAt) / (60 * 60 * 1000)
    console.log(timeDifference + ' ' + post.createdAt + ' ' + distinctReactionCount)
    let score = distinctReactionCount / Math.pow(timeDifference, 1.8)
    await Post.findOneAndUpdate({ _id: post._id }, { score: score })
  })
}

module.exports = {
  start () {
    setIntervalSync(async function () {
      await updateUserRecommendations()
    }, 1000 * 60 * 15)
    setIntervalSync(async function () {
      await updatePostSimilarity()
    }, 1000 * 60 * 15)
    setIntervalSync(async function () {
      await updateTrendingPosts()
    }, 1000 * 60 * 10)
  }
}
