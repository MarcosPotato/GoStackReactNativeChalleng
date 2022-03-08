import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        const response = await AsyncStorage.getItem("@chart")
        setProducts(JSON.parse(response || "[]"))
      } catch (error) {
        console.log(error)
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(async id => {
    try {
      const increasedProducts = products.map(product => {
        if(product.id === id){
          return ({
            ...product,
            quantity: product.quantity + 1
          })
        } else{
          return product
        }
      })
      await AsyncStorage.setItem("@chart", JSON.stringify(increasedProducts))
      setProducts(increasedProducts)

    } catch (error) {
      console.log(error)
    }
  }, [products]);

  const decrement = useCallback(async id => {
    try {
      const increasedProducts = products.map(product => {
        if(product.id === id){
          return ({
            ...product,
            quantity: product.quantity <= 1 ? 1 : product.quantity - 1
          })
        } else{
          return product
        }
      })

      await AsyncStorage.setItem("@chart", JSON.stringify(increasedProducts))
      setProducts(increasedProducts)
      
    } catch (error) {
      console.log(error)
    }
  }, [products]);

  const addToCart = useCallback(async product => {
    const existProduct = products.findIndex(prod => prod.id === product.id)

    if(existProduct >= 0){
      return increment(product.id)
    }

    try {
      const chart = [...products, { ...product, quantity: 1 }]
      await AsyncStorage.setItem("@chart", JSON.stringify(chart))

      setProducts(chart)
    } catch (error) {
      console.log(error)
    }
  }, [products, increment]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
