import { ObjectId } from 'mongodb'

import { asyncLocalStorage } from '../../services/als.service.js'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

export const reviewService = { query, remove, add }

async function query(filterBy = {}) {
    console.log("🚀 ~ query ~ filterBy:", filterBy)
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('review')

        var reviews = await collection
            .aggregate([
                {
                    $match: criteria,
                },
                {
                    $lookup: {
                        localField: 'byUserId',
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
                        localField: 'aboutToyId',
                        from: 'toy',
                        foreignField: '_id',
                        as: 'aboutToy',
                    },
                },
                {
                    $unwind: '$aboutToy',
                },
                {
                    $project: {
                        txt: true,
                        createdAt: { $toDate: '$_id' },
                        'byUser._id': true,
                        'byUser.fullname': true,
                        'aboutToy._id': true,
                        'aboutToy.name': true,
                        'aboutToy.price': true,
                    },
                },
            ])
            .toArray()

        // Same result as $project above, but done in JS — less efficient and not ideal for large datasets.
        // reviews = reviews.map(review => {
        //     review.byUser = {
        //         _id: review.byUser._id,
        //         fullname: review.byUser.fullname,
        //     }
        //     review.aboutToy = {
        //         _id: review.aboutToy._id,
        //         name: review.aboutToy.name,
        //         price: review.aboutToy.price,
        //     }
        //     review.createdAt = review._id.getTimestamp()
        //     delete review.byUserId
        //     delete review.aboutToyId
        //     return review
        // })

        console.log("🚀 ~ query ~ reviews:", reviews)
        return reviews
    } catch (err) {
        loggerService.error('cannot get reviews', err)
        throw err
    }
}

async function remove(reviewId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const collection = await dbService.getCollection('review')

        const criteria = { _id: ObjectId.createFromHexString(reviewId) }
        //* remove only if user is owner/admin
        //* If the user is not admin, he can only remove his own reviews by adding byUserId to the criteria
        if (!loggedinUser.isAdmin) {
            criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id)
        }

        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        loggerService.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}

async function add(review) {
    try {
        const reviewToAdd = {
            byUserId: ObjectId.createFromHexString(review.byUserId),
            aboutToyId: ObjectId.createFromHexString(review.aboutToyId),
            txt: review.txt,
        }
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        return reviewToAdd
    } catch (err) {
        loggerService.error('cannot add review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.byUserId) {
        criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
    }

    if (filterBy.aboutToyId) {
        criteria.aboutToyId = ObjectId.createFromHexString(filterBy.aboutToyId)
    }
    return criteria
}
