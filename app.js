const searchInput = document.querySelector("#search-input");
const categoryTitle = document.querySelector("#category-title");
const buttons = document.querySelector("#buttons");
const btn = document.querySelectorAll(".btn");
const foodCards = document.querySelector("#food-cards");
const result = document.querySelector("#result");
const foodCardTemplate = foodCards.children.item(0);
const cardRecipe = document.querySelector("#card-recipe");
const header = document.querySelector("#header");
const youtubeLink = document.querySelector("#youtube-link");
const saved = document.querySelector("#saved");
const savedButton = document.querySelector("#saved-button");
const saveButton = document.querySelector(".save");
const savedRecipe = document.querySelector("#saved-recipe");

fetchCategories();

searchInput.addEventListener("input", search);

async function search() {
  const inputValue = searchInput.value.trim();

  if (inputValue) {
    header.style.display = "none";
    buttons.style.display = "none";
    categoryTitle.style.display = "none";
    foodCards.style.display = "none";
    result.classList.remove("hidden");
    buttons.style.display = "none";
    result.innerHTML = "";
  } else {
    foodCards.style.display = "flex";
    return;
  }

  const response = await (
    await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${inputValue}`
    )
  ).json();

  addRecipe(response, result);
}

function addRecipe(meal, targetElement) {
  targetElement.innerHTML = "";

  if (!meal.meals) {
    targetElement.textContent = "No recipe found.";
    return;
  }

  const recipeWrapper = document.createElement("div");
  recipeWrapper.className = "flex flex-col items-center";

  const foodTitle = document.createElement("div");
  foodTitle.textContent = meal.meals[0].strMeal;
  foodTitle.className = "text-lg ";
  recipeWrapper.appendChild(foodTitle);

  const foodImg = document.createElement("img");
  foodImg.setAttribute("src", meal.meals[0].strMealThumb);
  foodImg.className = "w-40 h-40 my-4 rounded-md";
  recipeWrapper.appendChild(foodImg);

  const ingredientTitle = document.createElement("div");
  ingredientTitle.textContent = "Ingradients";
  ingredientTitle.className = "text-md my-4";
  recipeWrapper.appendChild(ingredientTitle);

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal.meals[0][`strIngredient${i}`];
    const measure = meal.meals[0][`strMeasure${i}`];

    if (!ingredient || ingredient.trim() === "") {
      continue;
    }

    const measureIncradient = document.createElement("div");
    measureIncradient.textContent = `${measure} ${ingredient}`;
    measureIncradient.className = "text-sm";
    recipeWrapper.appendChild(measureIncradient);
  }

  if (meal.meals[0].strInstructions) {
    const instructionTitle = document.createElement("div");
    instructionTitle.className = "text-md my-4";
    instructionTitle.textContent = "Instructions";
    recipeWrapper.appendChild(instructionTitle);

    const instruction = document.createElement("div");
    instruction.textContent = meal.meals[0].strInstructions;
    instruction.className = "text-sm";
    recipeWrapper.appendChild(instruction);
  }

  const videoLink = document.createElement("a");
  videoLink.href = meal.meals[0].strYoutube;
  videoLink.textContent = "YouTube";
  videoLink.target = "_blank";
  videoLink.className =
    "text-white bg-red-700 my-4 p-3 border border-red-700 rounded-xl";
  recipeWrapper.appendChild(videoLink);

  targetElement.appendChild(recipeWrapper);
}

async function fetchCategories() {
  const response = await (
    await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?c=list`)
  ).json();

  const meals = response.meals;

  meals.forEach((meal) => {
    const categoryName = meal.strCategory;

    const newCategoryButton = document.createElement("button");
    newCategoryButton.className =
      "btn border border-none px-4 rounded-lg py-1 text-xs";
    newCategoryButton.textContent = categoryName;

    newCategoryButton.addEventListener("click", function () {
      document.querySelectorAll("#buttons button").forEach((btn) => {
        btn.className = "btn border border-none px-4 py-1 rounded-lg text-xs";
      });

      newCategoryButton.className =
        "border border-[#129575] bg-[#129575] px-4 py-1 rounded-lg text-xs text-white";

      fetchExampleMealsByCategory(categoryName);
    });

    buttons.appendChild(newCategoryButton);
  });
}

async function fetchExampleMealsByCategory(categoryName) {
  const response = await (
    await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`
    )
  ).json();

  const meals = response.meals;

  foodCards.innerHTML = "";

  meals.forEach((meal) => {
    const newFoodCard = foodCardTemplate.cloneNode(true);
    newFoodCard.style.display = "flex";

    newFoodCard.childNodes.forEach((child) => {
      if (child.id === "food-card-image") {
        child.setAttribute("src", meal.strMealThumb);
      } else if (child.id === "food-name") {
        child.textContent = meal.strMeal;
      }
    });
    foodCards.appendChild(newFoodCard);
  });
}

foodCards.addEventListener("click", async (e) => {
  if (e.target.classList.contains("food-name")) {
    const mealName = e.target.textContent.trim();

    const mealDetailResponse = await (
      await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`
      )
    ).json();

    if (mealDetailResponse.meals) {
      header.style.display = "none";
      buttons.style.display = "none";
      categoryTitle.style.display = "none";
      foodCards.style.display = "none";
      header.style.display = "none";
      cardRecipe.classList.remove("hidden");
      cardRecipe.innerHTML = "";
      addRecipe(mealDetailResponse, cardRecipe);
    }
  }

  if (e.target.classList.contains("youtube-link")) {
    const card = e.target.closest("#food-card");
    const mealName = card.querySelector("#food-name").textContent.trim();

    const meal = await (
      await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`
      )
    ).json();

    const url = meal.meals[0].strYoutube;
    window.open(url, "_blank");
  }

  if (e.target.classList.contains("save")) {
    const card = e.target.closest("#food-card");
    const mealName = card.querySelector("#food-name").textContent.trim();
    const saveButton = e.target;

    const mealResponse = await (
      await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`
      )
    ).json();
    const meal = mealResponse.meals[0];

    saveMealToLocalStorage(meal);

    saveButton.classList.remove("fa-regular", "text-gray-600");
    saveButton.classList.add("fa-solid", "text-black");
  }
});

savedButton.addEventListener("click", () => {
  header.style.display = "none";
  buttons.style.display = "none";
  categoryTitle.style.display = "none";
  foodCards.style.display = "none";
  cardRecipe.style.display = "none";
  result.style.display = "none";

  saved.classList.remove("hidden");

  const meals = getSavedMealsFromLocalStorage();

  meals.forEach((meal) => {
    const foodCard = foodCardTemplate.cloneNode(true);

    foodCard.style.display = "flex";

    foodCard.childNodes.forEach((child) => {
      if (child.id === "food-card-image") {
        child.setAttribute("src", meal.strMealThumb);
      } else if (child.id === "food-name") {
        child.textContent = meal.strMeal;
      } else if (child.id === "food-bottom") {
        const saveIcon = child.querySelector(".save");
        saveIcon.classList.remove("fa-regular", "text-gray-600");
        saveIcon.classList.add("fa-solid", "text-black");
      }
    });

    saved.appendChild(foodCard);
  });
});

saved.addEventListener("click", async (e) => {
  if (e.target.classList.contains("save")) {
    const card = e.target.closest("#food-card");
    const mealName = card.querySelector("#food-name").textContent.trim();
    const saveButton = e.target;
  }

  if (e.target.classList.contains("food-name")) {
    const mealName = e.target.textContent.trim();
    const mealDetailResponse = await (
      await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`
      )
    ).json();

    if (mealDetailResponse.meals) {
      saved.style.display = "none";
      savedRecipe.classList.remove("hidden");
      addRecipe(mealDetailResponse, savedRecipe);
    }
  }
});

const savedMealsKey = "my-saved-meals";

async function saveMealToLocalStorage(meal) {
  const savedMeals = getSavedMealsFromLocalStorage() ?? [];

  if (savedMeals.some((m) => m.idMeal === meal.idMeal)) {
    return;
  }

  savedMeals.push(meal);

  localStorage.setItem(savedMealsKey, JSON.stringify(savedMeals));
}

function getSavedMealsFromLocalStorage() {
  return JSON.parse(localStorage.getItem(savedMealsKey));
}
