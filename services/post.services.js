const savedPostModel = require('../schema/savedPost');

module.exports = {

    //sortPost function returns the sorting conditions
    sortPost: function (sortby, sortOrder) {
        //SORTING
        const sort = {}
        if (sortby) {
            sort.title = sortOrder ? 1 : -1
        }
        else {
            sort._id = sortOrder ? 1 : -1
        }
        return sort;
    },

    //this function returns searching criteria of db query
    _searchPostBy: function (searchingOf) {
        //SEARCHING Posts by search value passed in query parameters
        const search = [
            {
                "title": {
                    $regex: searchingOf
                    //options to search with capitalize
                    // , $options: "i"
                }
            },
            {
                "description": {
                    $regex: searchingOf
                    //options to search with capitalize
                    // , $options: "i"
                }
            }
        ]
        return search
    },

    _filteredPost: function (filter, userId) {
        const obj ={};
        if (filter == 'others') {
            obj.$ne = userId
            return obj
        }
        obj.$eq = userId
        return obj

    },
    findObject: async function (req,userId) {
        const _this = this;
        //SEARCHING Posts by 
        const find = {}
        if (req.query.search) {
            find.$or = _searchPostBy(req.query.search)
        }
        let archived = false;
        //ARCHIVED POSTS only
        if (req.query.arch) {
            find.isArchived = {
                $eq: true
            }
            find.user_id = {
                $eq: userId
            }
            archived = true;
        }
        else {
            find.isArchived = {
                $eq: false
            }
        }

        //FILTERING
        if (req.query.filter == 'saved') {
            let savedPostIds = await savedPostModel.distinct('postID', {
                userID: userId
            });
            find._id = {
                $in: savedPostIds
            }
        } else if (req.query.filter == 'allPosts') {
            find.isArchived = {
                $eq: false
            }
        }
        else {
            find.user_id = _this._filteredPost(req.query.filter, userId)
        }
        return find
    }
}