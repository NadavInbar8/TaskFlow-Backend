const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const ObjectId = require('mongodb').ObjectId;

async function query() {
  try {
    // const criteria = _buildCriteria(filterBy);
    const criteria = {};

    const collection = await dbService.getCollection('board');
    // console.log('collection', collection);
    var boards = await collection.find(criteria).toArray();
    // console.log(boards);

    return boards;
  } catch (err) {
    logger.error('cannot find boards', err);
    throw err;
  }
}

async function getById(boardId) {
  try {
    const collection = await dbService.getCollection('board');
    const board = collection.findOne({ _id: ObjectId(boardId) });
    // console.log(board);
    return board;
  } catch (err) {
    logger.error(`while finding board ${boardId}`, err);
    throw err;
  }
}

async function remove(boardId) {
  try {
    const collection = await dbService.getCollection('board');
    await collection.deleteOne({ _id: ObjectId(boardId) });
    return boardId;
  } catch (err) {
    logger.error(`cannot remove board ${boardId}`, err);
    throw err;
  }
}

async function add(board) {
  board.createdAt = Date.now();
  try {
    const collection = await dbService.getCollection('board');
    await collection.insertOne(board);

    return board;
  } catch (err) {
    logger.error('cannot insert board', err);
    throw err;
  }
}
async function update(board) {
  try {
    var id = ObjectId(board._id);
    delete board._id;
    const collection = await dbService.getCollection('board');
    const updatedBoard = await collection.updateOne(
      { _id: id },
      { $set: { ...board } }
    );
    // console.log('updatedBoard', updatedBoard);
    board._id = id;
    // console.log('this is the board without id ', board);
    return board;
  } catch (err) {
    logger.error(`cannot update board ${boardId}`, err);
    throw err;
  }
}

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
};
