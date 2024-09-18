"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignUp from "./sign-up/page";
import SignIn from "./sign-in/page";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export default function Home() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    quantity: 1,
  });
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [groupBy, setGroupBy] = useState("day");
  const [totalForGrouping, setTotalForGrouping] = useState(0);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/sign-in");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const userItemsCollection = collection(db, "users", user.uid, "items");
    const q = query(userItemsCollection, orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];
      let allCategories = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        itemsArr.push({ ...data, id: doc.id });
        allCategories.add(data.category);
      });

      setItems(itemsArr);
      setCategories(Array.from(allCategories).sort());

      const today = new Date();
      let totalAmount = 0;

      itemsArr.forEach((item) => {
        const itemDate = new Date(item.date);
        const isToday = itemDate.toDateString() === today.toDateString();
        const isCurrentMonth =
          itemDate.getFullYear() === today.getFullYear() &&
          itemDate.getMonth() === today.getMonth();

        if (groupBy === "day" && isToday) {
          totalAmount += item.price * item.quantity;
        } else if (groupBy === "month" && isCurrentMonth) {
          totalAmount += item.price * item.quantity;
        } else if (groupBy === "overall") {
          totalAmount += item.price * item.quantity;
        }
      });

      setTotalForGrouping(totalAmount);
    });

    return () => unsubscribe();
  }, [groupBy, user]);

  const addItem = async (e) => {
    e.preventDefault();
    if (
      newItem.name !== "" &&
      newItem.price !== "" &&
      newItem.category !== ""
    ) {
      const userItemsCollection = collection(db, "users", user.uid, "items");
      await addDoc(userItemsCollection, {
        name: capitalizeFirstLetter(newItem.name.trim()),
        price: parseFloat(newItem.price),
        category: capitalizeFirstLetter(newItem.category.trim()),
        quantity: parseInt(newItem.quantity, 10),
        date: new Date().toISOString(),
      });

      setNewItem({ name: "", price: "", category: "", quantity: 1 });
      setShowCategoryList(false);
    }
  };

  const deleteItem = async (id) => {
    if (user) {
      const itemDoc = doc(db, "users", user.uid, "items", id);
      await deleteDoc(itemDoc);
    }
  };

  const deleteCategory = (categoryToDelete) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category !== categoryToDelete)
    );
  };

  const handleCategoryChange = (groupName, selectedCategory) => {
    setCategoryFilter((prev) => ({
      ...prev,
      [groupName]: selectedCategory,
    }));
  };

  const filteredGroupedItems = (dateCategory) => {
    const selectedCategory = categoryFilter[dateCategory] || "All Categories";
    return (
      groupedItems[dateCategory].filter(
        (item) =>
          selectedCategory === "All Categories" ||
          item.category === selectedCategory
      ) || []
    );
  };

  const getGroupingCategory = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    if (groupBy === "day") {
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } else if (groupBy === "month") {
      if (date >= startOfMonth) {
        return date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      } else {
        return "Previous Months";
      }
    } else if (groupBy === "overall") {
      return "Overall";
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = getGroupingCategory(item.date);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const calculateTotalForGrouping = (group) => {
    return Object.values(group).reduce((sum, items) => {
      return (
        sum +
        items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0)
      );
    }, 0);
  };

  const filteredCategories = categories
    .filter((category) =>
      category.toLowerCase().startsWith(newItem.category.toLowerCase())
    )
    .map((category) => capitalizeFirstLetter(category));

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!user) {
    if (isSignUp) {
      return (
        <div>
          <SignUp />
          <p>
            Already have an account?{" "}
            <button onClick={() => setIsSignUp(false)}>Sign In</button>
          </p>
        </div>
      );
    }

    return (
      <div>
        <SignIn />
        <p>
          Don't have an account?{" "}
          <button onClick={() => setIsSignUp(true)}>Sign Up</button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-dark-purple text-white text-center rounded-lg p-6 mb-4 shadow-lg">
          <h2 className="text-3xl font-bold">₹{totalForGrouping.toFixed(2)}</h2>
          <p>
            {groupBy === "day" && "Today's Total Expenses"}
            {groupBy === "month" &&
              `Total Expenses for ${new Date().toLocaleString("en-US", {
                month: "long",
              })}`}
            {groupBy === "overall" && "Overall Expenses"}
          </p>
          <button
            onClick={handleSignOut}
            className="mt-4 bg-white text-black p-2 rounded-md"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            Add New Expense
          </h3>
          <form onSubmit={addItem} className="space-y-4">
            <input
              value={newItem.name}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  name: capitalizeFirstLetter(e.target.value),
                })
              }
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
              type="text"
              placeholder="Enter Item"
            />
            <input
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
              type="number"
              placeholder="Enter Amount"
            />

            <div className="relative">
              <div className="flex items-center">
                <input
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      category: capitalizeFirstLetter(e.target.value),
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 pr-10"
                  type="text"
                  placeholder="Enter Category"
                  onClick={() => setShowCategoryList(!showCategoryList)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCategoryList(!showCategoryList);
                  }}
                >
                  {showCategoryList ? "▲" : "▼"}{" "}
                </button>
              </div>
              {showCategoryList && (
                <div className="absolute top-full left-0 w-full mt-1 border border-gray-300 bg-white z-10 rounded-md shadow-lg">
                  {filteredCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setNewItem({ ...newItem, category: category });
                        setShowCategoryList(false);
                      }}
                    >
                      <span className="text-gray-800">{category}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(category);
                        }}
                        className="text-black hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
              type="number"
              placeholder="Enter Quantity"
            />
            <button
              type="submit"
              className="w-full bg-dark-purple text-white p-3 rounded-md hover:bg-purple-700"
            >
              Add Expense
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Group By</h3>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setGroupBy("day")}
              className={`p-2 rounded-md ${groupBy === "day" ? "bg-dark-purple text-white" : "bg-gray-200"
                }`}
            >
              Day
            </button>
            <button
              onClick={() => setGroupBy("month")}
              className={`p-2 rounded-md ${groupBy === "month"
                ? "bg-dark-purple text-white"
                : "bg-gray-200"
                }`}
            >
              Month
            </button>
            <button
              onClick={() => setGroupBy("overall")}
              className={`p-2 rounded-md ${groupBy === "overall"
                ? "bg-dark-purple text-white"
                : "bg-gray-200"
                }`}
            >
              Overall
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            All Expenses
          </h3>

          <div className="mb-4">
            <label
              htmlFor="categoryFilter"
              className="text-gray-600 font-semibold mr-2"
            >
              Sort by Category:
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="All Categories">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {capitalizeFirstLetter(category)}
                </option>
              ))}
            </select>
          </div>

          {Object.keys(groupedItems).map((dateCategory) => {
            const filteredItems =
              categoryFilter === "All Categories"
                ? groupedItems[dateCategory]
                : groupedItems[dateCategory].filter(
                  (item) => item.category === categoryFilter
                );

            return (
              <div key={dateCategory} className="mb-4">
                <h4 className="text-lg font-bold text-gray-600 mb-2">
                  {dateCategory}
                </h4>
                {filteredItems.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    No items for this category.
                  </p>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center mb-2 p-3 bg-gray-100 rounded-md shadow-sm"
                    >
                      <div className="flex-none bg-dark-purple text-white rounded-full h-10 w-10 flex items-center justify-center text-sm md:text-base">
                        {capitalizeFirstLetter(item.category)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex-grow ml-4">
                        <p className="font-semibold text-sm md:text-base text-gray-800">
                          {capitalizeFirstLetter(item.name)}
                        </p>
                        <p className="text-gray-500 text-xs md:text-sm">
                          ₹{item.price} x {item.quantity}
                        </p>
                        <p className="text-gray-500 text-xs md:text-sm">
                          {capitalizeFirstLetter(item.category)}
                        </p>
                      </div>
                      <div className="flex-none">
                        <p className="text-sm md:text-lg font-bold text-gray-800">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex-none ml-2">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="bg-dark-purple text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-purple-600"
                          aria-label="Delete Item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {categoryFilter !== "All Categories" &&
                  filteredItems.length > 0 && (
                    <div className="mt-4 flex justify-center items-center font-bold text-white bg-dark-purple p-2 rounded-lg">
                      Total for {capitalizeFirstLetter(categoryFilter)}: ₹
                      {calculateTotalForGrouping({
                        [dateCategory]: filteredItems,
                      }).toFixed(2)}
                    </div>
                  )}
                {categoryFilter == "All Categories" &&
                  filteredItems.length > 0 && (
                    <div className="mt-4 flex justify-center items-center font-bold text-white bg-dark-purple p-2 rounded-lg">
                      Total for {dateCategory}: ₹
                      {calculateTotalForGrouping({
                        [dateCategory]: groupedItems[dateCategory],
                      }).toFixed(2)}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
