import { elements } from "./base";

/*
image_url: "http://forkify-api.herokuapp.com/images/best_pizza_dough_recipe1b20.jpg"
publisher: "101 Cookbooks"
publisher_url: "http://www.101cookbooks.com"
recipe_id: "47746"
social_rank: 100
source_url: "http://www.101cookbooks.com/archives/001199.html"
title: "Best Pizza Dough Ever*/
const renderRecipe = recipe => {
    const markup = `
                <li>
                    <a class="results__link" href="#${recipe.recipe_id}">
                        <figure class="results__fig">
                            <img src="${recipe.image_url}" alt="Test">
                        </figure>
                        <div class="results__data">
                            <h4 class="results__name">${recipe.title}</h4>
                            <p class="results__author">${recipe.publisher}</p>
                        </div>
                    </a>
                </li>
    `;
    // ul рүүгээ шинээр нэмнэ
    elements.searchResultList.insertAdjacentHTML("beforeend", markup);

};

export const getInput = () => elements.searchInput.value;

export const renderRecipes = (recipes, currentPage = 1, resPerPage = 10) => {
    // жишээ нь: page = 2 үед start = 10, end = 20
    // Массив-д байгаа хоолнуудаас хэдээс нь эхэлж гаргахыг тооцооло
    const start = (currentPage - 1) * resPerPage;
    // хэд хүртэл нь гаргахыг тооцоолох
    const end = currentPage * resPerPage

    recipes.slice(start, end).forEach(renderRecipe);

    // Хуудаслалтын товчуудыг гаргаж үзүүлэх
    // 4.2 ==> 5
    const totalPages = Math.ceil(recipes.length / resPerPage);
    renderButtons(currentPage, totalPages);
}

export const clearSearchQuery = () => {
    elements.searchInput.value = "";
}
export const clearSearchResult = () => {
    elements.searchResultList.innerHTML = '';
    elements.pageButtons.innerHTML = '';
}
// type ===> 'prev', 'next'
const createButton = (page, type, direction) => `<button class="btn-inline results__btn--${type}" data-goto= ${page}>
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-triangle-${direction}"></use>
                    </svg>
                    <span>Хуудас ${page}</span>
                </button>`;

const renderButtons = (currentPage, totalPages) => {
    let buttonHtml;
    if (currentPage === 1 && totalPages > 1) {
        // 1-р хуудсан дээр байна, 2-р хуудас гэдэг товчийг гаргана
        buttonHtml = createButton(2, "next", 'right');
    }
    else if (currentPage < totalPages) {
        // Өмнөх болон дараачийн хуудас руу шилжүүлэх товчуудыг үзүүлнэ
        buttonHtml = createButton(currentPage - 1, "prev", 'left');
        buttonHtml += createButton(currentPage + 1, "next", 'right');
    }
    else if (currentPage === totalPages) {
        // Хамгийн сүүлийн хуудас дээр байна. Өмнөх рүү шилжүүлэх товчийг л үзүүлнэ
        buttonHtml = createButton(currentPage - 1, "prev", 'left');
    }
    elements.pageButtons.insertAdjacentHTML("afterbegin", buttonHtml);
}
