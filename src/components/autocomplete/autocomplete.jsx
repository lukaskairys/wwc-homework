import React, { useState, useEffect } from "react";
import axios from "axios";
import classNames from "classnames";

import { ReactComponent as MovieIcon } from "../../assets/icons/movie.svg";
import { ReactComponent as SearchIcon } from "../../assets/icons/search.svg";
import useDebounce from "../../customHooks/useDebounce";
import "./autocomplete.scss";

const Autocomplete = () => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [wasSelected, setWasSelected] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch && debouncedSearch.length >= 3) {
      setShowOptions(false);
      setIsSearching(true);
      getOptions(debouncedSearch)
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("Problem with the request");
          }
          setShowOptions(true);
          setIsSearching(false);
          setOptions(response.data.results);
        })
        .catch((err) => console.error(err.message));
    } else {
      setShowOptions(false);
    }
  }, [debouncedSearch]);

  const getOptions = (string) => {
    /* API key hidden in .env file, which is excluded in commit with .gitignore*/
    return axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_API_KEY}&language=en-US&query=${string}`
    );
  };

  return (
    <div className="autocomplete">
      <form action="autocomplete__form" className="autocomplete__form">
        <div className="autocomplete__search-field">
          <MovieIcon className="autocomplete__movie-icon" />
          <input
            type="text"
            value={searchTerm}
            className={classNames("autocomplete__input", {
              "autocomplete__input--is-not-empty": searchTerm !== "",
            })}
            placeholder="Enter a movie name"
            onFocus={() => {
              setWasSelected(false);
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowOptions(false);
              }, 200);
            }}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
          />
        </div>
        <button className="autocomplete__button">
          <SearchIcon />
        </button>
      </form>

      {isSearching && !wasSelected && (
        <div className="autocomplete__options">
          <li className="autocomplete__option autocomplete__option--searching">
            <span>Searching</span>
            <img
              className="autocomplete__spinner"
              src="https://raw.githubusercontent.com/Codelessly/FlutterLoadingGIFs/master/packages/cupertino_activity_indicator.gif"
              alt="laoding spinner"
            />
          </li>
        </div>
      )}
      {showOptions && !wasSelected && options && (
        <ul className="autocomplete__options">
          {options.length === 0 && (
            <li className="autocomplete__option autocomplete__option--searching">
              {`There is no movie with the title containing ${searchTerm}, try another title`}
            </li>
          )}
          {options.slice(0, 8).map((option, index) => {
            return (
              <li
                className="autocomplete__option"
                key={index}
                onClick={() => {
                  setSearchTerm(option.title);
                  setWasSelected(true);
                }}
              >
                <p className="autocomplete__option-title"> {option.title} </p>
                <p className="autocomplete__option-info">
                  {`${option.vote_average.toFixed(1)} Rating, ${
                    option.release_date
                      ? option.release_date.substring(0, 4)
                      : ""
                  }`}{" "}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
