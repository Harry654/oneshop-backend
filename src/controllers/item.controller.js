// const { Configuration, OpenAIApi, embeddings_utils ,get_embedding, cosine_similarity } = require("openai");
// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY
// });
// const openai = new OpenAIApi(configuration);

// const openai = require('openai');
// openai.apiKey = process.env.OPENAI_API_KEY;

const Item = require("../model/item.model");
const Category = require("../model/category.model");
const User = require("../model/user.model");

const handleGetCategoryItems = async (req, res) => {
    try{
        // return console.log(req.query)
        let { categoryId, limit } = req.query;
        let categoryItems = await Item.find({ category_id: categoryId }).limit(limit);
        res.status(200).json({
            message: "items retrieved sucessfully",
            categoryItems,
            statusCode: 200,
            success: true
        });
    }catch(error){
        res.status(500).json({
            message: "Internal server error",
            error,
            statusCode: 500,
            success: false
        });
    }
}

const handleGetItems = async (req, res) => {
    try{
        // const response = await openai.Embedding.create( "lazy fox", "text-embedding-ada-002" )
        // return console.log(response['data'][0]['embedding']);
        
        const categories = await Category.find();
        const categoryIds = categories.map((category) => { return category._id.toString() });

        let categoryId = req.query.categoryId || 'all';
        const category = categoryId === 'all' ? categoryIds : categoryId.split();

        // return console.log(category);
        const search = req.query.search ? req.query.search : "";
        let { limit } = req.query;
        let allItems = await Item.find({ 
            $and: [
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } }, 
                        { description: { $regex: search, $options: 'i' } }, 
                    ]
                },
                { category_id: { $in: category } }
            ]
        })
        .limit(limit);
        res.status(200).json({
            message: "items retrieved sucessfully",
            allItems,
            statusCode: 200,
            success: true
        });
        // return console.log("d")
    }catch(error){
        res.status(500).json({
            message: "Internal server error",
            error,
            statusCode: 500,
            success: false
        });
    }
}
const handleNewItem = async (req, res) => {
    try{
        let itemData = JSON.parse(req.body.itemData);
        let thumbnails = req.files.map((file) => { return file.filename });
        // return console.log(thumbnails)
        itemData = { ...itemData, thumbnails }
        let newItem = new Item(itemData);
        newItem = await newItem.save();

        res.status(201).json({
            message: "item added sucessfully",
            newItem,
            statusCode: 201,
            success: true
        });
    }catch(error){
        console.log("New Item error" + error);
        res.status(500).json({
            message: "Internal server error",
            error,
            statusCode: 500,
            success: false
        });
    }
}

const handleGetItem = async (req, res) => {
    try{
        let { id: itemId } = req.params;

        let item = await Item.find({ _id: itemId });
        if(item.length === 0) {
            return res.status(404).json({
                message: "item not found",
                statusCode: 404,
                success: false
            });
        }

        item = item[0];
        const user = await User.find({ _id: item.owner_id });
        // item['owner'] = user[0];
        // return console.log(item);

        res.status(201).json({
            message: "item added sucessfully",
            item,
            owner: user[0],
            statusCode: 201,
            success: true
        });
    }catch(error){
        console.log(error)
        res.status(500).json({
            message: "Internal server error",
            error,
            statusCode: 500,
            success: false
        });
    }
}

module.exports = {
    handleNewItem,
    handleGetItems,
    handleGetCategoryItems,
    handleGetItem
};