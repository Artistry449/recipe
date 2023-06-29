require("@babel/polyfill");
import Search from "./model/Search";
import { elements, renderLoader, clearLoader } from "./view/base";
import * as searchView from "./view/searchView";
import Recipe from "./model/Recipe";
import { renderRecipe, clearRecipe } from './view/recipeView';
/*
 * Web app төлөв
 * - Хайлтын query, үр дүн
 * - Тухайн үзүүлж байгаа жор
 * - Лайкласан жорууд
 * - Захиалж байгаа жорын найрлаганууд
 */

const state = {};

const controlSearch = async () => {
    // 1) Вэбээс хайлтын түлхүүр үгийг гаргаж авна.
    const query = searchView.getInput();

    if (query) {
        // 2) Шинээр хайлтын обьектийг үүсгэж өгнө.
        state.search = new Search(query);

        // 3) Хайлт хийхэд зориулж дэлгэцийг UI бэлтгэнэ.
        searchView.clearSearchQuery();
        searchView.clearSearchResult();
        renderLoader(elements.searchResultDiv);
        // 4) Хайлтыг гүйцэтгэнэ
        await state.search.doSearch();

        // 5) Хайлтын үр дүнг дэлгэцэнд үзүүлнэ.
        clearLoader();
        if (state.search.result === undefined) alert("Илэрц олдсонгүй");
        else searchView.renderRecipes(state.search.result);
    }
};

elements.searchForm.addEventListener("submit", e => {
    e.preventDefault();
    controlSearch();
});
elements.pageButtons.addEventListener("click", e => {
    const btn = e.target.closest('.btn-inline');

    if (btn) {
        // convert goto to 10th(decimal) number
        const gotoPageNumber = parseInt(btn.dataset.goto, 10);
        searchView.clearSearchQuery();
        searchView.clearSearchResult();
        searchView.renderRecipes(state.search.result, gotoPageNumber);
    }
});

// Жорын контроллер
const controlRecipe = async () => {
    // 1. URL-аас ID-г салгаж авна
    const id = window.location.hash.replace('#', '');

    // 2. Жорын моделийг үүсгэж өгнө
    state.recipe = new Recipe(id);

    // 3. UI-ийг бэлтгэнэ
    clearRecipe();
    renderLoader(elements.recipeDiv);

    // 4. Жороо татаж авчирна
    await state.recipe.getRecipe();

    // 5. Жорыг гүйцэтгэх хугацаа болон орцыг тооцоолно
    clearLoader();
    state.recipe.calcTime();
    state.recipe.calcHuniiToo();
    // 6. Жороо дэлгэцэнд гаргана
    renderRecipe(state.recipe);
}
window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);