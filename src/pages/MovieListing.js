import React, { useState, useEffect, useMemo } from 'react'
import { Routes, Route, useParams, useLocation, Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Listing  from  '../components/Listing';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Form from 'react-bootstrap/Form';
import '../styles/MovieListing.css';

const MovieListing = ({watchType}) => {

  function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search, [search]));
  }

  const [refreshMe, setRefreshMe] = useState(false);
  const [checkValue, setCheckValue] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [movieData, setMovieData] = useState([]);
  const [query, setQuery] = useState(useQuery());
  const [refresh, setRefresh] = useState(useQuery(false));
  const radios = [ 
    { name: "Most Watched", value: 'mostWatched' },
    { name: "Release Date", value: 'releaseDate' },
    { name: "Recently Added", value: 'recentlyAdded' }
  ]

  const clearAllQueryValues = () => {
    setCheckValue(false);
    setRadioValue('');
    setFilterValue('');
    setQuery('');
  }
  
  const buildQueryString = (options) => {
    let genre = options?.genre??filterValue;
    let sort = options?.sort??radioValue;
    let free = options?.free??checkValue;
    let hasString = (genre == '') && (sort == '') && (free == 'off') ? false : true;

    let queryString = hasString?`?`:''
    let append = "";
    if(options?.genre){
      append = append + ((genre == '') ? "" : `genre=${genre}`);
      append = append + ((sort == '') ? "" :  `${append==""?"":"&"}sort=${sort}`);
      append = append + ((free == 'off' || free == '') ? "" : `${append==""?"":"&"}free=${free}`);
    }

    if(options?.sort){
      append = append + ((sort == '') ? "" :  `sort=${sort}`);
      append = append + ((genre == '') ? "" : `${append==""?"":"&"}genre=${genre}`);
      append = append + ((free == 'off' || free == '') ? "" : `${append==""?"":"&"}free=${free}`);
    }

    if(options?.free){
      append = append + ((free == 'off' || free == '') ? "" : `free=${free}`);
      append = append + ((genre == '') ? "" : `${append==""?"":"&"}genre=${genre}`);
      append = append + ((sort == '') ? "" :  `${append==""?"":"&"}sort=${sort}`);
    }

    setRefresh(!refresh)
    setRefreshMe(true);
    setQuery(queryString+append);
    return queryString+append;
  }


  useEffect(()=>{
    let genre = '';
    let arrQuery = [];
    if(query != null && typeof(query) == 'string'){
      const str = query.slice(1);
      arrQuery = [...(str.split('&'))]
    }

    let fetchApiQuery = "?";
    let append = "";

    arrQuery.forEach(q=>{
      const queryArr = q.split('=');
      switch(queryArr[0]){
        case 'sort':
          switch(queryArr[1]){
            case 'mostWatched':
              append = (append=="")?(append+"_sort=rating"):(append+"&_sort=f1");
              break;
            case 'releaseDate':
              append = (append=="")?(append+"_sort=releaseDate"):(append+"&_sort=f1");
              break;
            case 'recentlyAdded':
              append = (append=="")?(append+"_sort=addedOn"):(append+"&_sort=f1");
              break;
          }
        break;
        case 'genre':
          // append = (append=="")?(append+"genre_like="+queryArr[1]):(append+"genre_like="+queryArr[1]);
          genre = queryArr[1];
        break;
        case 'free':
          append = (append=="")?(append+"promoType=Free%20with%20Ads"):(append+"&promoType=Free%20with%20Ads");
        break;
      }
    })

    fetch(`http://localhost:8000/movies${arrQuery.length>0?(fetchApiQuery+append):""}`)
    .then((res) => {
      return res.json(res);
    })
    .then((data) => {
      if(genre == ''){
        return data;
      } else {
        // const par = JSON.parse(data);
        return data.filter(el=>{
          return el.genre.includes(genre)
        });
      }
    })
    .then((filteredData)=>{
      setMovieData(filteredData);
    })

 }, [ radioValue, filterValue, checkValue]);

  useEffect(()=>{
    clearAllQueryValues();
  }, []);

  return (
    <div className="mainContainer">
        <div>
          <NavigationBar/>
          <Header title={'Top Picks for Your Binge-Worthy Nights'}/>
        </div>
        <div className='universal_container listing_outer_container'>
            <div className='listing_filter_container'>
              <Dropdown onSelect={(eventkey )=>{
                setFilterValue(eventkey);
                window.history.pushState({genre:filterValue, sort:radioValue, free:checkValue}, "", `/movies${buildQueryString({genre:eventkey})}`);
              }} >
                <Dropdown.Toggle variant="success" id="dropdown-basic" className="listing_dropdown_style">
                  {(filterValue == '' || filterValue ==null)?"Filters":filterValue}
                </Dropdown.Toggle>
                <Dropdown.Menu >
                  <Dropdown.Item eventKey="Action">Action</Dropdown.Item>
                  <Dropdown.Item eventKey="Adventure">Adventure</Dropdown.Item>
                  <Dropdown.Item eventKey="Horror">Horror</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <div className="listing_check_style">
                <Form.Check // prettier-ignore
                  type={'checkbox'}
                  id={`default-checkbox`}
                  label={`Free ${watchType??'Movies'} Only`}
                  onChange={(e)=>{
                    setCheckValue(e.target.checked)
                    window.history.pushState({genre:filterValue, sort:radioValue, free:checkValue}, "", `/movies${buildQueryString({free:e.target.checked?'on':'off'})}`);
                  }}
                />
              </div>
            </div>
            <div className='listing_button_container'>
              <ButtonGroup className="listing_button_flex_container">
                {radios.map((radio, idx) => (
                  <ToggleButton
                    key={`radio-${idx}-${radio.value}`}
                    id={`radio-${idx}`}
                    type="radio"
                    variant={'outline-primary'}
                    name="radio"
                    value={radio.value}
                    checked={radioValue === radio.value}
                    onClick={()=>{
                      setRadioValue(radio.value);
                      window.history.pushState({genre:filterValue, sort:radioValue, free:checkValue}, "", `/movies${buildQueryString({sort:radio.value})}`);
                    }}
                  >
                    {radio.name}
                  </ToggleButton>
                ))}
              </ButtonGroup>
            </div>
            <Listing list={movieData} title={"movieListingPage"}/>
        </div>
        <Footer/>  
    </div>
  )
}

export default MovieListing
