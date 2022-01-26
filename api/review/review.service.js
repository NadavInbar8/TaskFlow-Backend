const dbService = require('../../services/db.service');
const ObjectId = require('mongodb').ObjectId;
const asyncLocalStorage = require('../../services/als.service');

async function query(filterBy = {}) {
  console.log('im in the query in back');
  try {
    const criteria = _buildCriteria(filterBy);
    const collection = await dbService.getCollection('review');
    // console.log(collection);
    // const reviews = await collection.find(criteria).toArray()
    var reviews = await collection
      .aggregate([
        {
          $match: criteria,
        },
        {
          $lookup: {
            localField: 'userId',
            from: 'user',
            foreignField: '_id',
            as: 'byUser',
          },
        },
        {
          $unwind: '$byUser',
        },
        {
          $lookup: {
            localField: 'boardId',
            from: 'board',
            foreignField: '_id',
            as: 'board',
          },
        },
        {
          $unwind: '$board',
        },
      ])
      .toArray();
    // console.log(reviews);
    reviews = reviews.map((review) => {
      review.byUser = {
        _id: review.byUser._id,
        fullname: review.byUser.fullname,
      };
      review.board = {
        _id: review.board._id,
        name: review.board.name,
      };
      delete review.userId;
      delete review.boardId;
      return review;
    });
    // console.log(reviews);

    return reviews;
  } catch (err) {
    logger.error('cannot find reviews', err);
    throw err;
  }
}

async function remove(reviewId) {
  try {
    const store = asyncLocalStorage.getStore();
    const { userId, isAdmin } = store;
    const collection = await dbService.getCollection('review');
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(reviewId) };
    if (!isAdmin) criteria.byUserId = ObjectId(userId);
    await collection.deleteOne(criteria);
  } catch (err) {
    logger.error(`cannot remove review ${reviewId}`, err);
    throw err;
  }
}

async function add(review) {
  try {
    const reviewToAdd = {
      byUserId: ObjectId(review.byUserId),
      aboutUserId: ObjectId(review.aboutUserId),
      txt: review.txt,
    };
    const collection = await dbService.getCollection('review');
    await collection.insertOne(reviewToAdd);
    return reviewToAdd;
  } catch (err) {
    logger.error('cannot insert review', err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.byUserId) criteria.byUserId = filterBy.byUserId;
  return criteria;
}

module.exports = {
  query,
  remove,
  add,
};
