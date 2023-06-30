require("@babel/polyfill");
import Search from "./model/Search";
import { elements, renderLoader, clearLoader } from "./view/base";
import * as searchView from "./view/searchView";
import Recipe from "./model/Recipe";
import { renderRecipe, clearRecipe, highlightSelectedRecipe } from './view/recipeView';
import List from "./model/List";
import * as listView from "./view/listView";
import Like from './model/Like';
import * as likesView from './view/likesView';

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

    // URL дээр ID байгаа эсэх
    if (id) {
        // 2. Жорын моделийг үүсгэж өгнө
        state.recipe = new Recipe(id);

        // 3. UI-ийг бэлтгэнэ
        clearRecipe();
        renderLoader(elements.recipeDiv);
        highlightSelectedRecipe(id);

        // 4. Жороо татаж авчирна
        await state.recipe.getRecipe();

        // 5. Жорыг гүйцэтгэх хугацаа болон орцыг тооцоолно
        clearLoader();
        state.recipe.calcTime();
        state.recipe.calcHuniiToo();

        // 6. Жороо дэлгэцэнд гаргана
        renderRecipe(state.recipe, state.likes.isLiked(id));
    }
}
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

window.addEventListener("load", e => {
    // Шинээр like моделийг апп дөнгөж ачааллагдахад үүсгэнэ
    if (!state.likes) state.likes = new Like();

    // эхлэх үед favourites icon-ийг гаргах эсэхийг шийдэх
    likesView.toggleLikeMenu(state.likes.getNumberOfLikes());

    // Лайкууд байвалл тэдгээрийг цэсэнд нэмж харуулна
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Найрлаганы контроллер

const controlList = () => {
    // Найрлаганы моделийг үүсгэнэ
    state.list = new List();

    // Өмнө байсан найрлагуудыг дэлгэцнээс цэвэрлэнэ
    listView.clearItems();

    // Уг модел руу одоо харагдаж байгаа бүх жорны найрлагыг авч хийнэ
    state.recipe.ingredients.forEach(n => {
        // Тухайн найрлагыг модел рүү хийнэ
        const item = state.list.addItem(n);

        // Тухайн найрлагыг дэлгэцэнд гаргана
        listView.renderItem(item);
    });


};

elements.recipeDiv.addEventListener('click', e => {
    // iim class-tai bolon iim classtai elementiin dotor bgaa bugden dr ni event tavih
    if (e.target.matches('.recipe__btn, .recipe__btn *')) {
        controlList();
    }
    else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
});

// Like контроллер

const controlLike = () => {
    // 1. Лайкийн моделийг үүсгэнэ
    if (!state.likes) state.likes = new Like();

    // 2. Одоо харагдаж байгаа жорын id-г олж авах
    const currentRecipeId = state.recipe.id;

    // 3. Энэ жорыг лайкласан эсэхийг шалгах
    if (state.likes.isLiked(currentRecipeId)) {
        // Лайкласан байгаа бол лайкийг нь болиулна
        state.likes.deleteLike(currentRecipeId);

        // favourites дотроос устгана
        likesView.deleteLike(currentRecipeId);

        // Лайк товчийг алга болгох
        likesView.toggleLikeBtn(false);
    }
    else {
        // Лайклаагүй бол лайклана xD
        const newLike = state.likes.addLike(
            currentRecipeId,
            state.recipe.title,
            state.recipe.publisher,
            state.recipe.image_url
        );
        // Лайк цэсэнд 
        likesView.renderLike(newLike);

        // Лайк товчийг гаргаж ирэх
        likesView.toggleLikeBtn(true);
    }
    likesView.toggleLikeMenu(state.likes.getNumberOfLikes())
}

elements.shoppingList.addEventListener('click', e => {
    // click хийсэн li элементийн data-itemid attribute-ийг шүүж гаргаж авах
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Олдсон ID-тэй орцыг моделоос устгана
    state.list.deleteItem(id);

    // Дэлгэцээс ийм ID-тай орцийг олж бас устгана
    listView.deleteItem(id);
});