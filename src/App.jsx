import { useState, useEffect } from 'react'
import './App.css'
import Card from './Components/card.jsx';
const API_KEY = import.meta.env.VITE_APP_API_KEY;

function App() {
  const [foodData, setfoodData] = useState(null);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [averageHealthScore, setAverageHealthScore] = useState(0);
  const [averageCalories, setAverageCalories] = useState(0);
  const [cuisine, setCuisine] = useState("chinese");
  useEffect(() => {
    const fetchFoodData = async () => {
      const response = await fetch(
          `https://api.spoonacular.com/recipes/complexSearch?cuisine=${cuisine}&apiKey=${API_KEY}&number=10&addRecipeInformation=true&addRecipeNutrition=true` 
        );
      const json = await response.json();
      setfoodData(json);
      setFilteredResults(json);
      setTotalRecipes(json.totalResults);
      console.log(json); //log
      let healthScore = 0;
      let avgCalories=0;
      for(let i = 0;i < json.number;i++){
        healthScore+=json.results[i].healthScore;
        avgCalories+=json.results[i].nutrition.nutrients[0].amount;
      }
      setAverageHealthScore(healthScore/json.number);
      setAverageCalories((avgCalories/json.number).toFixed(2));
    };
    fetchFoodData().catch(console);  
  }, [cuisine]);


  //searches
  const searchItems = async (food, ingredient, slider) => {
    setSearchFoodInput(food);
    setSearchIngredint(ingredient);
  
    console.log("start");
    console.log(foodData);
    const initialResults = { ...foodData };
    setFilteredResults(initialResults);
  
    if (ingredient !== "") {
      const updatedResults = await searchIngredients(initialResults, ingredient);
      setFilteredResults(updatedResults);
    }
  
    if (food !== "") {
      const updatedResults = await searchFoods(initialResults, food);
      setFilteredResults(updatedResults);
    }
  
    if(slider != 0){
      const updatedResults = await searchCalories(initialResults, slider);
    } 
    setDisplay(
      initialResults &&
        Object.entries(initialResults.results).map(([dish]) => (
          <Card
            image={initialResults.results[dish].image}
            ingredients={initialResults.results[dish].nutrition.ingredients}
            name={initialResults.results[dish].title}
            calories={initialResults.results[dish].nutrition.nutrients[0].amount}
            healthScore={initialResults.results[dish].healthScore}
          />
        ))
    );
  
    console.log("TEST");
    console.log(initialResults.results);
  };

  const searchFoods = (data, searchFood) => {
    console.log("food");
    console.log(data);
    setSearched(true);
    if (searchFood !== "") {
      const filtered = Object.fromEntries(
        Object.entries(data.results).filter(([, item]) =>
          item.title.toLowerCase().includes(searchFood.toLowerCase())
        )
      );
  
      data.results = filtered;
      console.log(data);
      console.log("food2");
    }
  };

  const searchIngredients = (data, searchIngredient) => {
    console.log("ing");
    console.log(data);
  
    if (searchIngredient !== "") {
      const filtered = Object.fromEntries(
        Object.entries(data.results).filter(([, item]) =>
          item.nutrition.ingredients.some((ingredient) =>
            ingredient.name.toLowerCase().includes(searchIngredient.toLowerCase())
          )
        )
      );
  
      data.results = filtered;
      console.log(data);
      console.log("ing2");
    }
  };

  const searchCalories = (data, calories) => {
    console.log("calories");
    if(calories != 0){
      const filtered = Object.fromEntries(
        Object.entries(data.results).filter(([, item]) =>
          item.nutrition.nutrients[0].amount < calories
        )
      );
      data.results = filtered;
    }
  }

  const handleCuisineChange = (event) => {
    setSearchFoodInput("");
    setSearchIngredint("");
    setSliderValue(0);
    setCuisine(event.target.value);
    setSearched(false);
  };
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchFoodInput, setSearchFoodInput] = useState("");
  const [searchIngredient, setSearchIngredint] = useState("");
  const [display, setDisplay] = useState(foodData && Object.entries(foodData.results).map(([dish]) => 
                                  <Card image={foodData.results[dish].image} 
                                  ingredients={foodData.results[dish].nutrition.ingredients} 
                                  name={foodData.results[dish].title} 
                                  calories={foodData.results[dish].nutrition.nutrients[0].amount  } 
                                  healthScore={foodData.results[dish].healthScore}/> 
                                )
                              );
  const [searched, setSearched] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  return (
    <div className = "the-world">
      <h1>Amazing Recipes!</h1>
      <div className = "stats-container">
        <div className= "stat-card">
          <h3>Total Number of Recipes</h3>
          <h4>{totalRecipes}</h4>
        </div>
        <div className= "stat-card">
          <h3>Average Health Score</h3>
          <h4>{averageHealthScore}</h4>
        </div>
        <div className= "stat-card">
          <h3>Average Calories:</h3>
          <h4>{averageCalories}</h4>
        </div>
      </div>
      
      <div className = "search-bars">
        <div>
          <label htmlFor="foodSelect">Cuisine: </label>
          <select id="foodSelect" name="food" value={cuisine} onChange = {handleCuisineChange}>
            <option value="chinese">Chinese</option>
            <option value="american">American</option>
            <option value="french">French</option>
            <option value="mexican">Mexican</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Foods"
          onChange={(inputString) => setSearchFoodInput(inputString.target.value)}
        />
        <input
          type="text"
          placeholder="Ingredients"
          onChange={(inputString) => setSearchIngredint(inputString.target.value)}
        />
        <div className = "sliderClass">
          <label>Calories: {sliderValue}</label>
          <input 
            type="range" 
            name="calories-slider" 
            min="0.0" 
            max="1000.0" 
            step="10"
            onChange={(slide) => setSliderValue(parseFloat(slide.target.value))}
          />
        </div>
        <button onClick={() => searchItems(searchFoodInput, searchIngredient, sliderValue)}>Search</button>
      </div>
      { searched ? 
          display
        : foodData && Object.entries(foodData.results).map(([dish]) => 
            <Card image={foodData.results[dish].image} 
            ingredients={foodData.results[dish].nutrition.ingredients} 
            name={foodData.results[dish].title} 
            calories={foodData.results[dish].nutrition.nutrients[0].amount  } 
            healthScore={foodData.results[dish].healthScore}/> 
          )
      }
      
    </div>
  )
}

export default App