// SET THE EVENT LISTENERS
document.getElementById("flex-container-left").addEventListener("click", displayInfo);
document.getElementById("flex-container-right").addEventListener("click", displayInfo);
document.querySelector(".button_search").addEventListener("click", movieSearch);
document.querySelector(".dropdown-content").addEventListener("click", favouriteMovieInfo);
window.addEventListener("load", displayLikes);
window.addEventListener("hashchange", function () {
    if (location.href === "file:///C:/Users/Nikola/Desktop/practice/Untitled-1.html") {
        clearUI();
        document.querySelector(".search_field").value = null;
    }
});

// STORE THE ARRAY
let movieInfo;
movies().then(res => {
    movieInfo = res;
    console.log(movieInfo);
    return movieInfo;
});

// LIKES ARRAY DECLARATION  
var likes;

// TOP RATED MOVIES API (GETTING ID'S, DISPLAYING TITLES AND CREATING MOVIE INFO ARRAY)
async function movies() {
    try {
    const result = await fetch (`https://api.themoviedb.org/3/movie/top_rated?api_key=821e6e287624c7921335f083519db105&language=en-US&page=1`);
    const movies = await result.json();

    const titles = movies.results.map(el => el.title);
    titles.forEach(displayTitle);
    const rating = movies.results.map(el => el.vote_average);
    rating.forEach((el, i) => {
        document.getElementById(`movie-title-${i}`).innerHTML += ` - ${el}`;
    })

    const ids = movies.results.map(el => el.id);
    let likesArr = JSON.parse(localStorage.getItem("favourites"));
    if (likesArr) {
    let likesId = likesArr.map(el => el.id)
    likesId.forEach(el => {
       if (ids.some(elem => el === elem) === false) {
           ids.push(el);
       }
       return ids;
    });
    }

    const details = ids.map(getDetails);
    let finalRes = [];
    details.forEach(function(el) {
       el.then(res => finalRes.push(res))
       return finalRes;
    });

    return finalRes;

    
    } catch(err) {
        console.log(err);
    }

};

// GETTING MOVIE DETAILS
async function getDetails(id) {

  try {
  const result = await fetch (`https://api.themoviedb.org/3/movie/${id}?api_key=821e6e287624c7921335f083519db105&language=en-US1`);
  const resultJSON = await result.json();
  const castCall = await fetch (`https://api.themoviedb.org/3/movie/${id}/credits?api_key=821e6e287624c7921335f083519db105`);
  const castJSON = await castCall.json();
  const configCall = await fetch (`https://api.themoviedb.org/3/configuration?api_key=821e6e287624c7921335f083519db105`);
  const configCallJSON = await configCall.json();

  // GET IMAGES
  const posterPath = resultJSON.poster_path;
  const baseURL = configCallJSON.images.base_url;
  const size = configCallJSON.images.logo_sizes[4];
  const imgURL = generateImgURL(baseURL, size, posterPath);


  // GET MOVIE DETAILS
  const name = resultJSON.title;
  const rating = resultJSON.vote_average;
  const ratingCount = resultJSON.vote_count;
  const genres = resultJSON.genres.map(el => el.name).join(", ");
  const year = resultJSON.release_date.slice(0,4);
  const overview = resultJSON.overview;
  const duration = resultJSON.runtime;
  const castArr = castJSON.cast;
  let cast = "";
  const crewArr = castJSON.crew;
  let crew = "";

  for (let i = 0; i < 10; i++) {
     cast += castArr[i].name + `, `
  }
  
  for (let i = 0; i < 5; i++) {
    crew += `<b>${crewArr[i].job}</b>` + `: ` + crewArr[i].name + `, `;
  }

  // CHECK IF A MOVIE HAS BEEN LIKED
  let likesArr = JSON.parse(localStorage.getItem("favourites"));
  let favourite;
  if (likesArr) {
     var like = likesArr.some(el => el.name === name);
  }
  if (like) {
    favourite = true;
  } else {
    favourite = false;
  }

  return {name, rating, ratingCount, year, genres, overview, duration, cast, crew, imgURL, favourite, id};

} catch(err) {
    console.log(err);
}

}

function displayTitle(el, index) {
    let elementDOM = document.getElementById(`movie-title-${index}`);
    elementDOM.innerHTML = el;
};



function displayInfo(event) {

    location.hash = "#part1";

    // GET THE VALUE OF THE TARGET ELEMENT
    let id = event.target.id;
    if (event.target.parentNode.id !== "flex-container-right" && event.target.parentNode.id !== "flex-container-left") {
    let splitArr = document.getElementById(`${id}`).childNodes[0].nodeValue.split(" - ");
    let value = splitArr[0];

    // CLEAR THE USER INTERFACE
    document.getElementById("middle1").innerHTML = "";
    
    // GET THE INDEX OF THE TARGET ELEMENT
    let titles = movieInfo.map(el => el.name);
    let index = titles.findIndex(el => el === value);
    // CREATE MARKUP HTML
    let markUp = `
    <div id="middle-container">
    <div class="image1"><img class="image" src="${movieInfo[index].imgURL}" alt="${movieInfo[index].name}"></div>
            <div class="movie-info">
                <h1 class="movie-title">${movieInfo[index].name} - ${movieInfo[index].year}</h1>
                <p><strong>GENRE:</strong> ${movieInfo[index].genres}</p>
                <p class="rating"><strong>RATING:</strong> ${movieInfo[index].rating} (${movieInfo[index].ratingCount} votes)</p>
                <p class="crew"><strong>CREW:</strong> ${movieInfo[index].crew}</p>
                <p class="cast"><strong>CAST:</strong> ${movieInfo[index].cast}</p>
                <b><span id="fav-text" style="color:red"></span></b>
                <p id="rem-fav"></p>
                <button class="favourites">Add to favourites</button><button id="close">Close window</button>
            </div>
        <div class="description">
           <p><strong>OVERVIEW:</strong> ${movieInfo[index].overview}</p>
    </div>
    </div>`;
    document.getElementById("middle1").innerHTML = markUp;
    document.getElementById("close").addEventListener("click", clearUI);
    document.querySelector(".favourites").addEventListener("click", addToFavourites);
    
    if (movieInfo[index].favourite === true) {
        document.querySelector(".favourites").remove();
        document.getElementById("fav-text").innerHTML = "Added to favourites!";
        document.getElementById("rem-fav").innerHTML = `<button id="rem">Remove from favourites</button>`;
        document.getElementById(`rem`).addEventListener("click", removeFromFavourites);
    }
}
}

function generateImgURL(url, size, path) {
    let URL = url + size + path;
    return URL;
}

// IMPLEMENTING MOVIE SEARCH
async function movieSearch() {

    location.hash = "#part1";

    // READ VALUE FROM THE SEARCH FIELD
    let query = document.querySelector(".search_field").value.toString();
    
    // DISPLAY MOVIE INFO IN DOM
    if (query) {
        try {
        document.getElementById("middle1").innerHTML = "";
        let movie = await fetch (`https://api.themoviedb.org/3/search/movie?api_key=821e6e287624c7921335f083519db105&language=en-US&query=${query}&page=1&include_adult=false`)
        let movieJSON = await movie.json();

        let id = movieJSON.results[0].id;

        getDetails(id).then(res => {
            let markUp = `
            <div id="middle-container">
            <div class="image1"><img class="image" src="${res.imgURL}" alt="${res.name}"></div>
                    <div class="movie-info">
                        <h1 class="movie-title">${res.name} - ${res.year}</h1>
                        <p><strong>GENRE:</strong> ${res.genres}</p>
                        <p class="rating"><strong>RATING:</strong> ${res.rating} (${res.ratingCount} votes)</p>
                        <p class="crew"><strong>CREW:</strong> ${res.crew}</p>
                        <p class="cast"><strong>CAST:</strong> ${res.cast}</p>
                        <b><span id="fav-text" style="color:red"></span></b>
                        <p id="rem-fav"></p>
                        <button class="favourites">Add to favourites</button><button id="close">Close window</button>
                    </div>
                <div class="description">
                   <p><strong>OVERVIEW:</strong> ${res.overview}</p>
            </div>
            </div>`;

            document.getElementById("middle1").innerHTML = markUp;
            document.querySelector(".favourites").addEventListener("click", function () {
                addToFavourites(id);
            });
            document.getElementById("close").addEventListener("click", clearUI);

        // CHECK IF REQUIRED MOVIE IS IN FAVOURITES
        let ids = movieInfo.map(el => el.id);
        let i = ids.findIndex(el => el === id);
            if (i !== -1 && movieInfo[i].favourite === true) {
                document.querySelector(".favourites").remove();
                document.getElementById("fav-text").innerHTML = "Added to favourites!";
                document.getElementById("rem-fav").innerHTML = `<button id="rem">Remove from favourites</button>`;
                document.getElementById(`rem`).addEventListener("click", removeFromFavourites);
        };
        })
        } catch(error) {
            document.getElementById("middle1").innerHTML = "";
            let markUp = `<h1 id="error">NO RESULTS FOUND.</h1>`;
            document.getElementById("middle1").innerHTML = markUp;
        }    
    } 
};

function clearUI() {
    document.getElementById("middle1").innerHTML = "";
}

function addToFavourites(id) {
    let array = document.querySelector(".movie-title").childNodes[0].nodeValue.split(" - ");
    let title = array[0];
    let titles = movieInfo.map(el => el.name);
    let index = titles.findIndex(el => el === title);

    if (index !== -1) {

    let markUp = `<p class="fav-movie">${movieInfo[index].name}</p>`
    document.querySelector(".dropdown-content").innerHTML += markUp;

    movieInfo[index].favourite = true;
    document.querySelector(".favourites").remove();
    document.getElementById("fav-text").innerHTML = "Added to favourites!";
    document.getElementById("rem-fav").innerHTML = `<button id="rem">Remove from favourites</button>`;
    document.getElementById(`rem`).addEventListener("click", removeFromFavourites);

     // ADD FAVOURITES TO LOCAL STORAGE
    if (likes === undefined || likes === null) {
            likes = []; 
            let obj = {name:movieInfo[index].name, id:movieInfo[index].id};  
            likes.push(obj);
            let likesString = JSON.stringify(likes);
            localStorage.setItem(`favourites`, likesString);
    } else {
            let obj = {name:movieInfo[index].name, id:movieInfo[index].id};  
            likes.push(obj);
            let likesString = JSON.stringify(likes);
            localStorage.setItem(`favourites`, likesString);
    }

    document.getElementById("heart").className = "fas fa-heart";
    document.querySelector(".tooltiptext").innerHTML = `${likes.length}`;  

    } else {

        getDetails(id).then(res => {
            let markUp = `<p class="fav-movie">${res.name}</p>`
            document.querySelector(".dropdown-content").innerHTML += markUp;
            res.favourite = true;
            movieInfo.push(res);

            document.querySelector(".favourites").remove();
            document.getElementById("fav-text").innerHTML = "Added to favourites!";
            document.getElementById("rem-fav").innerHTML = `<button id="rem">Remove from favourites</button>`;
            document.getElementById(`rem`).addEventListener("click", removeFromFavourites);
             
             // ADD FAVOURITES TO LOCAL STORAGE
            if (likes === undefined || likes === null) {
                likes = []; 
                let obj = {name:res.name, id:res.id};  
                likes.push(obj);
                let likesString = JSON.stringify(likes);
                localStorage.setItem(`favourites`, likesString);
            } else {
                let obj = {name:res.name, id:res.id};  
                likes.push(obj);
                let likesString = JSON.stringify(likes);
                localStorage.setItem(`favourites`, likesString);
            }

            document.getElementById("heart").className = "fas fa-heart";
            document.querySelector(".tooltiptext").innerHTML = `${likes.length}`;    

        })
    }  
};

function removeFromFavourites() {
    let array = document.querySelector(".movie-title").childNodes[0].nodeValue.split(" - ");
    let title = array[0];
    let titles = movieInfo.map(el => el.name);
    let index = titles.findIndex(el => el === title);

    let dropdownArr = Array.from(document.querySelectorAll("p.fav-movie"));
    let arr = dropdownArr.map(el => el.childNodes[0].nodeValue)
    let indeXX = arr.findIndex(el => el === title);
    dropdownArr[indeXX].remove();

    movieInfo[index].favourite = false;
    
    let markUp = `
    <div id="middle-container">
    <div class="image1"><img class="image" src="${movieInfo[index].imgURL}" alt="${movieInfo[index].name}"></div>
            <div class="movie-info">
                <h1 class="movie-title">${movieInfo[index].name} - ${movieInfo[index].year}</h1>
                <p><strong>GENRE:</strong> ${movieInfo[index].genres}</p>
                <p class="rating"><strong>RATING:</strong> ${movieInfo[index].rating} (${movieInfo[index].ratingCount} votes)</p>
                <p class="crew"><strong>CREW:</strong> ${movieInfo[index].crew}</p>
                <p class="cast"><strong>CAST:</strong> ${movieInfo[index].cast}</p>
                <b><span id="fav-text" style="color:red"></span></b>
                <p id="rem-fav"></p>
                <button class="favourites" id="${index}">Add to favourites</button><button id="close">Close window</button>
            </div>
        <div class="description">
           <p><strong>OVERVIEW:</strong> ${movieInfo[index].overview}</p>
    </div>
    </div>`;
    document.getElementById("middle1").innerHTML = markUp;
    document.getElementById("close").addEventListener("click", clearUI);
    document.querySelector(".favourites").addEventListener("click", addToFavourites);

    // REMOVE FAVOURITES FROM LOCAL STORAGE
    let i = likes.findIndex(el => el.name === movieInfo[index].name);
    likes.splice(i, 1);
    let likesString = JSON.stringify(likes);
    localStorage.setItem(`favourites`, likesString);

    if (likes.length === 0) {
        document.getElementById("heart").className = "far fa-heart";
    }

    document.querySelector(".tooltiptext").innerHTML = `${likes.length}`;    

}


function favouriteMovieInfo(event) {

    location.hash = "#part1"
    
    if (event.target.id !== "drop") {

    let value = event.target.childNodes[0].nodeValue;
    let titles = movieInfo.map(el => el.name);
    let index = titles.findIndex(el => el === value);
    let markUp =  `
    <div id="middle-container">
    <div class="image1"><img class="image" src="${movieInfo[index].imgURL}" alt="${movieInfo[index].name}"></div>
            <div class="movie-info">
                <h1 class="movie-title">${movieInfo[index].name} - ${movieInfo[index].year}</h1>
                <p><strong>GENRE:</strong> ${movieInfo[index].genres}</p>
                <p class="rating"><strong>RATING:</strong> ${movieInfo[index].rating} (${movieInfo[index].ratingCount} votes)</p>
                <p class="crew"><strong>CREW:</strong> ${movieInfo[index].crew}</p>
                <p class="cast"><strong>CAST:</strong> ${movieInfo[index].cast}</p>
                <b><span id="fav-text" style="color:red"></span></b>
                <p id="rem-fav"></p>
                <button id="close">Close window</button>
            </div>
        <div class="description">
           <p><strong>OVERVIEW:</strong> ${movieInfo[index].overview}</p>
    </div>
    </div>`;
    
    document.getElementById("middle1").innerHTML = "";
    document.getElementById("middle1").innerHTML += markUp;
    if (movieInfo[index].favourite === true) {
        document.getElementById("fav-text").innerHTML = "Added to favourites!";
        document.getElementById("rem-fav").innerHTML = `<button id="rem-${index}">Remove from favourites</button>`;
        document.getElementById(`rem-${index}`).addEventListener("click", removeFromFavourites);
    }
    document.getElementById("close").addEventListener("click", clearUI);
}

}

function displayLikes() {

    let likesArr = JSON.parse(localStorage.getItem("favourites"));
    document.querySelector(".tooltiptext").innerHTML = `${likesArr.length}`;    

    if (likesArr.length > 0) {
    document.getElementById("heart").className = "fas fa-heart";    
    likesArr.forEach(el => {
        let markUp = `<p class="fav-movie">${el.name}</p>`
        document.querySelector(".dropdown-content").innerHTML += markUp;
    }) };
    
    likes = likesArr;
    return likes;

}