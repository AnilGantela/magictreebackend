const Cart = require("../models/cartModel");

// Add a product to the user's cart or increment quantity if it exists
exports.addToCart = async (req, res) => {
  try {
    const { userId, product } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [product] });
    } else {
      const index = cart.items.findIndex(
        (item) => item.productId.toString() === product.productId
      );

      if (index > -1) {
        cart.items[index].quantity += product.quantity || 1;
      } else {
        cart.items.push(product);
      }
    }

    await cart.save();
    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: "Failed to retrieve cart" });
  }
};

// Update quantity of a product in the cart
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) return res.status(404).json({ message: "Product not in cart" });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Quantity updated", cart });
  } catch (error) {
    console.error("Error in updateCartItemQuantity:", error);
    res.status(500).json({ message: "Failed to update quantity" });
  }
};

// Remove a specific product from the cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

// Clear the entire cart
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    );

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
