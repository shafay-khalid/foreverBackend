import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// function for adding product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      bestseller,
      sizes,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes.replace(/'/g, '"')),
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
    console.log(error);
  }
};

// function for listing product
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({
      success: true,
      message: "Product Removed",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// function for updating product
const updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      category,
      subCategory,
      bestseller,
      sizes,
    } = req.body;

    // Find the existing product
    const product = await productModel.findById(id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Handle image uploads
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    let imagesUrl = [...product.image]; // Start with existing images

    // Upload new images and replace in the array
    if (image1) {
      let result = await cloudinary.uploader.upload(image1.path, {
        resource_type: "image",
      });
      imagesUrl[0] = result.secure_url;
    }
    if (image2) {
      let result = await cloudinary.uploader.upload(image2.path, {
        resource_type: "image",
      });
      imagesUrl[1] = result.secure_url;
    }
    if (image3) {
      let result = await cloudinary.uploader.upload(image3.path, {
        resource_type: "image",
      });
      imagesUrl[2] = result.secure_url;
    }
    if (image4) {
      let result = await cloudinary.uploader.upload(image4.path, {
        resource_type: "image",
      });
      imagesUrl[3] = result.secure_url;
    }

    // Update product data
    const updatedData = {
      name: name || product.name,
      description: description || product.description,
      category: category || product.category,
      price: price ? Number(price) : product.price,
      subCategory: subCategory || product.subCategory,
      bestseller: bestseller !== undefined ? (bestseller === "true" ? true : false) : product.bestseller,
      sizes: sizes ? JSON.parse(sizes.replace(/'/g, '"')) : product.sizes,
      image: imagesUrl,
    };

    await productModel.findByIdAndUpdate(id, updatedData);

    res.json({ success: true, message: "Product Updated" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// function for getting single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { listProducts, addProduct, removeProduct, updateProduct, singleProduct };