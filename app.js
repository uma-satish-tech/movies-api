const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const sqlite3 = require("sqlite3");

let db = null;
const initializedDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("server started running at localhost:3001");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializedDBAndServer();

const dbObjToResObj = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};
// get all movies

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT movie_name FROM movie
    ;`;
  const moviesArray = await db.all(getAllMoviesQuery);
  response.send(moviesArray.map((eachMovie) => dbObjToResObj(eachMovie)));
});

// add movie into movie table

app.post("/movies/", async (request, response) => {
  const movie_data = request.body;
  const { directorId, movieName, leadActor } = movie_data;
  const addMovieQuery = `
    INSERT INTO movie (movie_name,director_id,lead_actor)
    VALUES ('${movieName}',${directorId},'${leadActor}')
    ;`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//get a movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const sqlQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId} ;
    `;
  const movie = await db.get(sqlQuery);
  response.send(movie);
});

// update movie

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
  UPDATE movie
  SET 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};
  `;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get directors List

app.get("/directors/", async (request, response) => {
  const getDirectorListQuery = `
    SELECT * FROM director
    ;`;
  const dbResponse = await db.all(getDirectorListQuery);
  response.send(dbResponse.map((each) => dbObjToResObj(each)));
});

//get movies of a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
    SELECT * FROM movie WHERE director_id = ${directorId};
    `;
  const new_moviesArray = await db.all(getMoviesQuery);
  response.send(new_moviesArray);
});

module.exports = app;
