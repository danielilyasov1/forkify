import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //loading the recipe
    await model.loadRecipe(id);

    //showing the recipe on the page - rendering recipe
    recipeView.render(model.state.recipe);

    //updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // get search query
    const query = searchView.getQuery();
    if (!query) return;

    // load search result
    await model.loadSearchResults(query);

    //render results
    resultsView.render(model.getSearchResultsPage());

    //render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (gotoPage) {
  //render new results
  resultsView.render(model.getSearchResultsPage(gotoPage));

  //render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update thr recipe servings(in state)
  model.updateServings(newServings);

  //update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe){
  try{
    //show loading spinner
    addRecipeView.renderSpinner()

    //upload the new recipe data
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe)

    //success message
    addRecipeView.renderMessage()

    //render bookmark view
    bookmarksView.render(model.state.bookmarks)

    //change id in url
    window.history.pushState(null,'',`#${model.state.recipe.id}`)
    
    //close form window
    setTimeout(() => {
      addRecipeView.toggleWindow()
    }, MODEL_CLOSE_SEC*1000);
  }catch(err){
    console.error(err)
    addRecipeView.renderError(err.message)
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe)
};
init();
