import { createContext, useState, useEffect } from 'react'

export const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart')
    return savedCart ? JSON.parse(savedCart) : []
  })

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (book) => {
    const existingItem = cartItems.find((item) => item.bookId === book.bookId)
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.bookId === book.bookId
            ? { ...item, quantity: item.quantity + 1, selected: true }
            : item
        )
      )
    } else {
      setCartItems([...cartItems, { ...book, quantity: 1, selected: true }])
    }
  }

  const removeFromCart = (bookId) => {
    setCartItems(cartItems.filter((item) => item.bookId !== bookId))
  }

  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId)
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.bookId === bookId ? { ...item, quantity } : item
        )
      )
    }
  }

  const toggleItemSelection = (bookId) => {
    setCartItems(
      cartItems.map((item) =>
        item.bookId === bookId ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const selectAllItems = () => {
    setCartItems(cartItems.map((item) => ({ ...item, selected: true })))
  }

  const deselectAllItems = () => {
    setCartItems(cartItems.map((item) => ({ ...item, selected: false })))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getSelectedItems = () => {
    return cartItems.filter((item) => item.selected)
  }

  const getSelectedTotalPrice = () => {
    return getSelectedItems().reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const removeSelectedItems = () => {
    setCartItems(cartItems.filter((item) => !item.selected))
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleItemSelection,
        selectAllItems,
        deselectAllItems,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getSelectedItems,
        getSelectedTotalPrice,
        removeSelectedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
